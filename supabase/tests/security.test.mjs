// Supabase 환경을 흉내 낸 메모리 속 PostgreSQL(PGlite) 위에서 마이그레이션과 보안 규칙(RLS)을 검증합니다.
// 실행: npm run db:test   (마이그레이션을 고칠 때마다 돌려서 보안 규칙이 깨지지 않았는지 확인하세요)
import { PGlite } from "@electric-sql/pglite"
import fs from "node:fs"
import { fileURLToPath } from "node:url"

const repo = fileURLToPath(new URL("../../", import.meta.url)).replace(/[\\/]$/, "")
const db = new PGlite()

// pg.Client 와 비슷하게 쓰기 위한 얇은 래퍼 (여러 문장이면 exec, 한 문장이면 query)
const c = {
  async query(sql, params) {
    const trimmed = sql.trim().replace(/;$/, "")
    if (params === undefined && /;\s*\S/.test(trimmed)) {
      await db.exec(sql)
      return { rows: [], rowCount: 0 }
    }
    const r = await db.query(sql, params)
    return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length }
  },
  async end() {
    await db.close()
  },
}
const server = { stop: async () => {} }

let passed = 0
const failures = []
const ok = (name) => { passed++; console.log("  PASS", name) }
const bad = (name, detail) => { failures.push(name); console.log("  FAIL", name, "→", detail) }

try {
  // ---------- Supabase 흉내 (역할, auth, storage) ----------
  await c.query(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

    create schema auth; grant usage on schema auth to anon, authenticated, service_role;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(coalesce(current_setting('request.jwt.claim.sub', true),
             (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')), '')::uuid $$;
    grant execute on function auth.uid() to anon, authenticated, service_role;

    create schema storage; grant usage on schema storage to anon, authenticated, service_role;
    create table storage.buckets (id text primary key, name text, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid default auth.uid());
    alter table storage.objects enable row level security;
    grant all on storage.objects, storage.buckets to anon, authenticated, service_role;
    create function storage.foldername(name text) returns text[] language plpgsql as $$
      declare _parts text[]; begin _parts := string_to_array(name, '/'); return _parts[1:array_length(_parts, 1) - 1]; end $$;
  `)

  // ---------- 마이그레이션 + 시드 ----------
  await c.query(fs.readFileSync(`${repo}/supabase/migrations/0001_init.sql`, "utf8"))
  console.log("마이그레이션 적용 완료")
  await c.query(fs.readFileSync(`${repo}/supabase/seed.sql`, "utf8"))
  console.log("시드 적용 완료\n")

  // ---------- 도우미 ----------
  const U = {
    alice: "11111111-1111-1111-1111-111111111111",
    bob: "22222222-2222-2222-2222-222222222222",
    admin: "99999999-9999-9999-9999-999999999999",
  }
  await c.query(`insert into auth.users (id, email, raw_user_meta_data) values
    ('${U.alice}', 'alice@example.com', '{"name":"김앨리스","phone":"010-1111-2222","marketing_consent":true}'),
    ('${U.bob}',   'bob@example.com',   '{"name":"박밥"}'),
    ('${U.admin}', 'admin@ooro.store',  '{"name":"관리자"}')`)
  await c.query(`update public.profiles set role = 'admin' where id = '${U.admin}'`)

  async function run(uid, role, sql, params = []) {
    await c.query("begin")
    try {
      await c.query(`set local role ${role}`)
      await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(uid ? { sub: uid, role } : { role })])
      const r = await c.query(sql, params)
      await c.query("commit")
      return r
    } catch (e) {
      await c.query("rollback")
      throw e
    }
  }
  const as = (uid, sql, params) => run(uid, "authenticated", sql, params)
  const anon = (sql, params) => run(null, "anon", sql, params)

  async function expect(name, fn, check) {
    try {
      const r = await fn()
      const res = check(r)
      if (res === true) ok(name)
      else bad(name, res)
    } catch (e) {
      bad(name, "예상 못한 에러: " + e.message)
    }
  }
  async function expectFail(name, fn, pattern) {
    try {
      await fn()
      bad(name, "실패해야 하는데 성공했어요")
    } catch (e) {
      if (pattern.test(e.message)) ok(name)
      else bad(name, "다른 에러: " + e.message)
    }
  }

  const addr = { recipient: "김앨리스", phone: "010-1111-2222", zip: "06236", address1: "서울 강남구 테헤란로 1", address2: "101호" }

  console.log("[가입 / 프로필]")
  await expect("가입하면 프로필이 자동 생성되고 메타데이터가 들어간다", () => c.query(`select * from public.profiles where id = '${U.alice}'`),
    (r) => (r.rows[0]?.name === "김앨리스" && r.rows[0].marketing_consent === true && r.rows[0].role === "customer") || JSON.stringify(r.rows))
  await expect("이메일이 바뀌면 프로필 이메일도 바뀐다", async () => {
    await c.query(`update auth.users set email = 'alice2@example.com' where id = '${U.alice}'`)
    return c.query(`select email from public.profiles where id = '${U.alice}'`)
  }, (r) => r.rows[0].email === "alice2@example.com" || JSON.stringify(r.rows))
  await expect("본인 프로필만 보인다 (일반 회원)", () => as(U.alice, `select id from public.profiles`), (r) => (r.rows.length === 1 && r.rows[0].id === U.alice) || r.rows.length)
  await expect("관리자는 모든 프로필이 보인다", () => as(U.admin, `select id from public.profiles`), (r) => r.rows.length === 3 || r.rows.length)
  await expectFail("일반 회원은 자기 role 을 바꿀 수 없다", () => as(U.alice, `update public.profiles set role = 'admin' where id = '${U.alice}'`), /permission denied/)
  await expect("이름·전화는 수정할 수 있다", async () => {
    await as(U.alice, `update public.profiles set name = '김앨리스', phone = '010-9999-0000' where id = '${U.alice}'`)
    return c.query(`select phone from public.profiles where id = '${U.alice}'`)
  }, (r) => r.rows[0].phone === "010-9999-0000" || JSON.stringify(r.rows))
  await expect("남의 프로필은 수정되지 않는다 (0행)", () => as(U.alice, `update public.profiles set name = '해킹' where id = '${U.bob}'`), (r) => r.rowCount === 0 || r.rowCount)

  console.log("\n[상품 / 재고 숨김]")
  await expect("비회원도 판매중 상품을 볼 수 있다 (6개)", () => anon(`select count(*)::int n from public.products_public`), (r) => r.rows[0].n === 6 || r.rows[0].n)
  await expect("공개 뷰에는 stock 컬럼이 없고 in_stock 만 있다", () => anon(`select * from public.products_public limit 1`),
    (r) => (!("stock" in r.rows[0]) && "in_stock" in r.rows[0]) || Object.keys(r.rows[0]).join(","))
  await expect("품절 상품은 in_stock=false", () => anon(`select in_stock from public.products_public where id = 'balance-magnesium'`), (r) => r.rows[0].in_stock === false || JSON.stringify(r.rows))
  await expectFail("비회원은 원본 products(재고 포함)를 직접 못 읽는다", () => anon(`select stock from public.products`), /permission denied/)
  await expect("일반 회원도 원본 products 는 0행", () => as(U.alice, `select * from public.products`), (r) => r.rows.length === 0 || r.rows.length)
  await expectFail("일반 회원은 상품을 등록할 수 없다", () => as(U.alice, `insert into public.products (name, price) values ('몰래 상품', 1)`), /row-level security/)
  await expectFail("일반 회원은 가격을 바꿀 수 없다", async () => {
    const r = await as(U.alice, `update public.products set price = 1 where id = 'calm-sleep-serum'`)
    if (r.rowCount === 0) throw new Error("row-level security: 0행 수정")
  }, /row-level security/)
  await expect("관리자는 상품을 등록·숨김할 수 있다", async () => {
    await as(U.admin, `insert into public.products (id, name, price, stock, images) values ('p-test', '테스트 상품', 1000, 5, array['x'])`)
    await as(U.admin, `update public.products set is_active = false where id = 'p-test'`)
    return anon(`select count(*)::int n from public.products_public where id = 'p-test'`)
  }, (r) => r.rows[0].n === 0 || r.rows[0].n)
  await expect("관리자는 원본(재고 포함)을 볼 수 있다", () => as(U.admin, `select stock from public.products where id = 'calm-sleep-serum'`), (r) => r.rows[0].stock === 18 || JSON.stringify(r.rows))

  console.log("\n[설정]")
  await expect("누구나 배송 설정을 읽는다", () => anon(`select value from public.shop_settings where key = 'shipping'`), (r) => r.rows[0].value.fee === 3000 || JSON.stringify(r.rows))
  await expectFail("일반 회원은 배송 설정을 못 바꾼다", async () => {
    const r = await as(U.alice, `update public.shop_settings set value = '{"fee":0,"free_threshold":0}' where key = 'shipping'`)
    if (r.rowCount === 0) throw new Error("row-level security: 0행 수정")
  }, /row-level security/)

  console.log("\n[배송지]")
  await expect("첫 배송지는 자동으로 기본이 된다", async () => {
    await as(U.alice, `insert into public.addresses (label, recipient, phone, zip, address1) values ('집','김앨리스','010-1111-2222','06236','서울')`)
    return as(U.alice, `select is_default from public.addresses`)
  }, (r) => (r.rows.length === 1 && r.rows[0].is_default) || JSON.stringify(r.rows))
  await expect("새 기본 배송지를 만들면 이전 기본은 해제된다", async () => {
    await as(U.alice, `insert into public.addresses (label, recipient, phone, zip, address1, is_default) values ('회사','김앨리스','010-1111-2222','04524','서울 중구', true)`)
    return as(U.alice, `select label, is_default from public.addresses order by created_at`)
  }, (r) => (r.rows.filter((x) => x.is_default).length === 1 && r.rows.find((x) => x.is_default).label === "회사") || JSON.stringify(r.rows))
  await expect("기본 배송지를 지우면 남은 배송지가 기본이 된다", async () => {
    await as(U.alice, `delete from public.addresses where label = '회사'`)
    return as(U.alice, `select label, is_default from public.addresses`)
  }, (r) => (r.rows.length === 1 && r.rows[0].is_default) || JSON.stringify(r.rows))
  await expect("남의 배송지는 보이지 않는다", () => as(U.bob, `select * from public.addresses`), (r) => r.rows.length === 0 || r.rows.length)
  await expectFail("남의 user_id 로 배송지를 만들 수 없다", () => as(U.bob, `insert into public.addresses (user_id, recipient, phone, zip, address1) values ('${U.alice}','x','010-1111-2222','06236','y')`), /row-level security/)
  await expectFail("잘못된 우편번호는 거부된다", () => as(U.bob, `insert into public.addresses (recipient, phone, zip, address1) values ('x','010-1111-2222','123','y')`), /check constraint/)

  console.log("\n[찜]")
  await expect("찜 추가 후 본인만 본다", async () => {
    await as(U.alice, `insert into public.wishlist (user_id, product_id) values ('${U.alice}', 'calm-sleep-serum')`)
    return as(U.bob, `select * from public.wishlist`)
  }, (r) => r.rows.length === 0 || r.rows.length)
  await expectFail("남의 이름으로 찜할 수 없다", () => as(U.bob, `insert into public.wishlist (user_id, product_id) values ('${U.alice}', 'balance-magnesium')`), /row-level security/)

  console.log("\n[주문 (place_order)]")
  const call = (uid, items, a = addr, memo = "문 앞에") =>
    as(uid, `select * from public.place_order($1::jsonb, $2::jsonb, $3)`, [JSON.stringify(items), JSON.stringify(a), memo])

  await expectFail("비로그인은 주문할 수 없다", () => anon(`select * from public.place_order('[]'::jsonb, '{}'::jsonb)`), /permission denied|not_authenticated/)
  await expectFail("빈 장바구니는 거부", () => call(U.alice, []), /empty_cart/)
  await expectFail("잘못된 배송지는 거부", () => call(U.alice, [{ product_id: "calm-sleep-serum", quantity: 1 }], { ...addr, zip: "1" }), /invalid_address/)
  await expectFail("옵션 필수 상품에서 옵션 누락 거부 (앰플 사이즈)", () => call(U.alice, [{ product_id: "daily-collagen-ampoule", quantity: 1 }]), /invalid_option/)
  await expectFail("없는 옵션 거부", () => call(U.alice, [{ product_id: "daily-collagen-ampoule", quantity: 1, size: "999ml" }]), /invalid_option/)
  await expectFail("옵션 없는 상품에 옵션 붙이기 거부", () => call(U.alice, [{ product_id: "calm-sleep-serum", quantity: 1, color: "검정" }]), /invalid_option/)
  await expectFail("품절 상품 거부", () => call(U.alice, [{ product_id: "balance-magnesium", quantity: 1 }]), /out_of_stock/)
  await expectFail("재고보다 많이 주문하면 거부 (앰플 재고 6)", () => call(U.alice, [{ product_id: "daily-collagen-ampoule", quantity: 7, size: "30ml" }]), /out_of_stock/)
  await expectFail("같은 상품 여러 줄도 합쳐서 재고 확인", () => call(U.alice, [
    { product_id: "daily-collagen-ampoule", quantity: 4, size: "30ml" },
    { product_id: "daily-collagen-ampoule", quantity: 4, size: "50ml" },
  ]), /out_of_stock/)
  await expectFail("숨김 상품 거부", () => call(U.alice, [{ product_id: "p-test", quantity: 1 }]), /product_unavailable/)
  await expectFail("수량 0 거부", () => call(U.alice, [{ product_id: "calm-sleep-serum", quantity: 0 }]), /invalid_quantity/)

  let order
  await expect("가격은 서버가 계산한다: 앰플 50ml(+24,000) 2개 + 로브 차콜(+10,000) M 1개", async () => {
    const r = await call(U.alice, [
      { product_id: "daily-collagen-ampoule", quantity: 2, size: "50ml", price: 1 }, // 클라이언트가 보낸 price 는 무시되어야 함
      { product_id: "linen-sleep-robe", quantity: 1, color: "차콜", size: "M" },
    ])
    order = r.rows[0]
    return r
  }, (r) => {
    const o = r.rows[0]
    const expected = 82000 * 2 + (128000 + 10000)
    return (o.subtotal === expected && o.shipping_fee === 0 && o.amount === expected && o.status === "주문 접수" && /^OR-\d{8}-[0-9A-F]{4}$/.test(o.id)) || JSON.stringify(o)
  })
  await expect("주문 상품이 스냅샷으로 저장된다", () => as(U.alice, `select name, price, quantity, color, size from public.order_items where order_id = $1 order by price desc`, [order.id]),
    (r) => (r.rows.length === 2 && r.rows[0].price === 138000 && r.rows[1].price === 82000 && r.rows[1].quantity === 2) || JSON.stringify(r.rows))
  await expect("배송비 3,000원 (5만원 미만)", async () => (await call(U.alice, [{ product_id: "calm-sleep-serum", quantity: 1 }])), (r) => (r.rows[0].shipping_fee === 3000 && r.rows[0].amount === 45000) || JSON.stringify(r.rows[0]))
  await expect("배송비 무료 기준 정확히 5만원", async () => {
    await as(U.admin, `update public.shop_settings set value = '{"fee":2500,"free_threshold":42000}' where key='shipping'`)
    return call(U.alice, [{ product_id: "calm-sleep-serum", quantity: 1 }])
  }, (r) => (r.rows[0].shipping_fee === 0 && r.rows[0].amount === 42000) || JSON.stringify(r.rows[0]))
  await as(U.admin, `update public.shop_settings set value = '{"fee":3000,"free_threshold":50000}' where key='shipping'`)

  await expectFail("주문을 직접 insert 할 수 없다", () => as(U.alice, `insert into public.orders (id, user_id, subtotal, shipping_fee, amount, recipient, phone, zip, address1) values ('X', '${U.alice}', 1, 0, 1, 'a','b','c','d')`), /permission denied/)
  await expect("내 주문만 보인다", () => as(U.bob, `select * from public.orders`), (r) => r.rows.length === 0 || r.rows.length)
  await expect("관리자는 모든 주문을 본다", () => as(U.admin, `select count(*)::int n from public.orders`), (r) => r.rows[0].n >= 3 || r.rows[0].n)
  await expectFail("일반 회원은 주문 상태를 바꿀 수 없다", async () => {
    const r = await as(U.alice, `update public.orders set status = '배송 완료' where id = '${order.id}'`)
    if (r.rowCount === 0) throw new Error("row-level security: 0행 수정")
  }, /row-level security/)
  await expectFail("일반 회원은 금액을 바꿀 수 없다", () => as(U.alice, `update public.orders set amount = 1 where id = '${order.id}'`), /permission denied/)

  console.log("\n[후기]")
  const review = (uid, orderId, productId) =>
    as(uid, `insert into public.reviews (product_id, order_id, rating, content, option_label, images) values ($1, $2, 5, '정말 좋아요', '차콜 / M', array['https://x/y.jpg']) returning *`, [productId, orderId])
  await expectFail("배송 전에는 후기를 쓸 수 없다", () => review(U.alice, order.id, "linen-sleep-robe"), /row-level security/)
  await expect("관리자가 배송 완료로 바꾼다", async () => {
    await as(U.admin, `update public.orders set status = '배송 완료' where id = $1`, [order.id])
    return c.query(`select status from public.orders where id = $1`, [order.id])
  }, (r) => r.rows[0].status === "배송 완료" || JSON.stringify(r.rows))
  await expectFail("남의 주문으로는 후기를 쓸 수 없다", () => review(U.bob, order.id, "linen-sleep-robe"), /row-level security/)
  await expectFail("주문에 없는 상품 후기는 거부", () => review(U.alice, order.id, "calm-sleep-serum"), /row-level security/)
  await expect("배송 완료 후 구매자는 후기를 쓸 수 있고 이름은 서버가 가린다", () => review(U.alice, order.id, "linen-sleep-robe"),
    (r) => (r.rows[0].author_name === "김**스" && r.rows[0].user_id === U.alice && r.rows[0].is_hidden === false) || JSON.stringify(r.rows[0]))
  await expectFail("같은 주문·상품에 두 번째 후기는 거부", () => review(U.alice, order.id, "linen-sleep-robe"), /duplicate key|unique/)
  await expectFail("후기에 user_id 를 직접 넣을 수 없다 (컬럼 권한)", () => as(U.alice, `insert into public.reviews (user_id, product_id, order_id, rating, content) values ('${U.bob}', 'linen-sleep-robe', '${order.id}', 5, 'x')`), /permission denied/)
  await expect("누구나 후기를 읽는다", () => anon(`select author_name, images from public.reviews where product_id = 'linen-sleep-robe'`), (r) => r.rows.length === 1 || r.rows.length)
  await expectFail("일반 회원은 후기를 숨길 수 없다", async () => {
    const r = await as(U.alice, `update public.reviews set is_hidden = true`)
    if (r.rowCount === 0) throw new Error("row-level security: 0행 수정")
  }, /row-level security|permission denied/)
  await expect("관리자가 후기를 숨기면 비회원에게 안 보인다", async () => {
    await as(U.admin, `update public.reviews set is_hidden = true`)
    return anon(`select * from public.reviews`)
  }, (r) => r.rows.length === 0 || r.rows.length)
  await as(U.admin, `update public.reviews set is_hidden = false`)

  console.log("\n[Q&A]")
  await expect("질문 등록 시 작성자 이름·user_id 는 서버가 정한다", async () => {
    const r = await as(U.alice, `insert into public.questions (product_id, title, content, is_secret, images) values ('calm-sleep-serum', '일반 질문', '내용', false, '{}') returning *`)
    await as(U.alice, `insert into public.questions (product_id, title, content, is_secret, images) values (null, '비밀 질문', '비밀 내용', true, array['${U.alice}/a.jpg']) returning *`)
    return r
  }, (r) => (r.rows[0].author_name === "김**스" && r.rows[0].user_id === U.alice) || JSON.stringify(r.rows[0]))
  await expect("다른 회원에게 비밀글은 제목·내용이 가려진다", () => as(U.bob, `select title, content, can_view, is_answered, images from public.questions_feed where is_secret`),
    (r) => (r.rows[0].title === "비밀글입니다." && r.rows[0].content === "" && r.rows[0].can_view === false && r.rows[0].images.length === 0) || JSON.stringify(r.rows))
  await expect("비회원에게도 비밀글은 가려진다", () => anon(`select title, content from public.questions_feed where is_secret`), (r) => (r.rows[0].title === "비밀글입니다." && r.rows[0].content === "") || JSON.stringify(r.rows))
  await expect("작성자 본인은 비밀글 내용을 본다", () => as(U.alice, `select title, content, is_mine from public.questions_feed where is_secret`), (r) => (r.rows[0].title === "비밀 질문" && r.rows[0].is_mine) || JSON.stringify(r.rows))
  await expect("관리자는 비밀글도 본다", () => as(U.admin, `select title from public.questions_feed where is_secret`), (r) => r.rows[0].title === "비밀 질문" || JSON.stringify(r.rows))
  await expect("공개 질문은 누구나 본다", () => anon(`select title from public.questions_feed where not is_secret`), (r) => r.rows[0].title === "일반 질문" || JSON.stringify(r.rows))
  await expectFail("원본 questions 는 비회원이 못 읽는다", () => anon(`select * from public.questions`), /permission denied/)
  await expect("다른 회원은 원본 questions 에서 남의 질문이 0행", () => as(U.bob, `select * from public.questions`), (r) => r.rows.length === 0 || r.rows.length)
  await expectFail("일반 회원은 답변을 달 수 없다", async () => {
    const r = await as(U.alice, `update public.questions set answer = '내가 답변' where title = '일반 질문'`)
    if (r.rowCount === 0) throw new Error("row-level security: 0행 수정")
  }, /row-level security|permission denied/)
  await expect("관리자가 답변하면 답변완료로 보인다", async () => {
    await as(U.admin, `update public.questions set answer = '안녕하세요', answered_at = now() where title = '일반 질문'`)
    return anon(`select is_answered, answer from public.questions_feed where title = '일반 질문'`)
  }, (r) => (r.rows[0].is_answered && r.rows[0].answer === "안녕하세요") || JSON.stringify(r.rows))
  await expect("비밀글 답변 여부(상태)는 보이지만 답변 내용은 가려진다", async () => {
    await as(U.admin, `update public.questions set answer = '비밀 답변', answered_at = now() where is_secret`)
    return as(U.bob, `select is_answered, answer from public.questions_feed where is_secret`)
  }, (r) => (r.rows[0].is_answered === true && r.rows[0].answer === null) || JSON.stringify(r.rows))
  await expectFail("질문에 answer 컬럼을 직접 넣을 수 없다", () => as(U.alice, `insert into public.questions (title, content, answer) values ('a','b','c')`), /permission denied/)

  console.log("\n[사진 저장소]")
  await expect("회원은 자기 폴더에 후기 사진을 올릴 수 있다", () => as(U.alice, `insert into storage.objects (bucket_id, name) values ('public-images', 'reviews/${U.alice}/a.jpg')`), (r) => r.rowCount === 1 || r.rowCount)
  await expectFail("남의 폴더에는 못 올린다", () => as(U.alice, `insert into storage.objects (bucket_id, name) values ('public-images', 'reviews/${U.bob}/a.jpg')`), /row-level security/)
  await expectFail("일반 회원은 상품 사진 폴더에 못 올린다", () => as(U.alice, `insert into storage.objects (bucket_id, name) values ('public-images', 'products/x/a.jpg')`), /row-level security/)
  await expect("관리자는 상품 사진을 올릴 수 있다", () => as(U.admin, `insert into storage.objects (bucket_id, name) values ('public-images', 'products/x/a.jpg')`), (r) => r.rowCount === 1 || r.rowCount)
  await expect("Q&A 사진: 본인 폴더에 올리기", () => as(U.alice, `insert into storage.objects (bucket_id, name) values ('question-photos', '${U.alice}/a.jpg')`), (r) => r.rowCount === 1 || r.rowCount)
  await expect("Q&A 사진: 비밀글 사진은 다른 회원이 못 본다", () => as(U.bob, `select name from storage.objects where bucket_id = 'question-photos'`), (r) => r.rows.length === 0 || r.rows.length)
  await expect("Q&A 사진: 작성자 본인은 본다", () => as(U.alice, `select name from storage.objects where bucket_id = 'question-photos'`), (r) => r.rows.length === 1 || r.rows.length)
  await expect("Q&A 사진: 관리자는 본다", () => as(U.admin, `select name from storage.objects where bucket_id = 'question-photos'`), (r) => r.rows.length === 1 || r.rows.length)
  await expect("Q&A 사진: 공개 질문에 첨부된 사진은 다른 회원도 본다", async () => {
    await as(U.alice, `insert into storage.objects (bucket_id, name) values ('question-photos', '${U.alice}/open.jpg')`)
    await as(U.alice, `insert into public.questions (title, content, is_secret, images) values ('사진 질문', '내용', false, array['${U.alice}/open.jpg'])`)
    return as(U.bob, `select name from storage.objects where bucket_id = 'question-photos'`)
  }, (r) => (r.rows.length === 1 && r.rows[0].name.endsWith("open.jpg")) || JSON.stringify(r.rows))

  console.log("\n[회원 탈퇴]")
  await expect("탈퇴해도 주문 기록은 남고 user_id 만 비워진다", async () => {
    await as(U.alice, `select public.delete_my_account()`)
    const orders = await c.query(`select count(*)::int n, count(user_id)::int with_user from public.orders where recipient = '김앨리스'`)
    const profile = await c.query(`select count(*)::int n from public.profiles where id = '${U.alice}'`)
    const addresses = await c.query(`select count(*)::int n from public.addresses`)
    return { orders: orders.rows[0], profile: profile.rows[0].n, addresses: addresses.rows[0].n }
  }, (r) => (r.orders.n >= 3 && r.orders.with_user === 0 && r.profile === 0 && r.addresses === 0) || JSON.stringify(r))
  await expect("탈퇴 후에도 후기는 남고 작성자 연결만 끊긴다", () => c.query(`select count(*)::int n, count(user_id)::int u from public.reviews`), (r) => (r.rows[0].n === 1 && r.rows[0].u === 0) || JSON.stringify(r.rows))
  await expectFail("비로그인은 탈퇴 함수를 못 쓴다", () => anon(`select public.delete_my_account()`), /permission denied/)
} catch (e) {
  console.error("\n치명적 오류:", e.message)
  failures.push("fatal: " + e.message)
} finally {
  await c.end()
  await server.stop()
}

console.log(`\n결과: 통과 ${passed}개, 실패 ${failures.length}개`)
if (failures.length) {
  console.log("실패 목록:\n - " + failures.join("\n - "))
  process.exitCode = 1
}

