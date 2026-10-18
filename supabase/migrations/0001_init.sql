-- =====================================================================
-- ooro. 쇼핑몰 데이터베이스 (Supabase / PostgreSQL)
--
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run.
--         (처음 한 번만 실행합니다. 자세한 안내는 supabase/README.md)
--
-- 보안 원칙
--  1) 모든 테이블에 RLS(행 단위 보안)를 켜고, "누가 무엇을 볼 수 있는지"를 DB가 직접 지킵니다.
--  2) 가격·재고·배송비 계산은 브라우저가 아니라 DB 함수(place_order)가 합니다.
--  3) 재고 숫자는 고객에게 내려주지 않습니다 (products_public 뷰에는 stock 컬럼이 없어요).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 공통 함수
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 이름 가리기: 홍길동 -> 홍*동, 김철 -> 김*, 선 -> 선
create or replace function public.mask_name(p_name text)
returns text
language sql
immutable
as $$
  select case
    when p_name is null or length(trim(p_name)) = 0 then ''
    when length(trim(p_name)) = 1 then trim(p_name)
    when length(trim(p_name)) = 2 then left(trim(p_name), 1) || '*'
    else left(trim(p_name), 1) || repeat('*', length(trim(p_name)) - 2) || right(trim(p_name), 1)
  end
$$;

-- ---------------------------------------------------------------------
-- 회원 (profiles): auth.users 와 1:1
-- ---------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text not null default '',
  name              text not null default '',
  phone             text not null default '',
  marketing_consent boolean not null default false,
  role              text not null default 'customer' check (role in ('customer', 'admin')),
  created_at        timestamptz not null default now()
);

-- 관리자인지 확인 (정책에서 사용)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
$$;

-- 가입하면 profiles 행을 자동으로 만듭니다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, marketing_consent)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'marketing_consent', 'false') = 'true'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 이메일이 바뀌면 profiles 에도 반영
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------
-- 상점 설정 (배송비 등) — 코드를 고치지 않고 값만 바꿀 수 있어요.
-- ---------------------------------------------------------------------
create table public.shop_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger shop_settings_updated_at
  before update on public.shop_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 상품
-- ---------------------------------------------------------------------
create table public.products (
  id            text primary key default ('p-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  name          text not null check (length(trim(name)) > 0),
  subtitle      text not null default '',
  category      text not null default '',
  price         integer not null check (price >= 0),
  stock         integer not null default 0 check (stock >= 0),
  is_active     boolean not null default true,
  images        text[] not null default '{}',
  colors        jsonb not null default '[]'::jsonb check (jsonb_typeof(colors) = 'array'),
  sizes         jsonb not null default '[]'::jsonb check (jsonb_typeof(sizes) = 'array'),
  ingredients   text not null default '',
  usage_guide   text not null default '',
  description   text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 고객에게 보여주는 상품 뷰: 재고 숫자는 빼고 "품절 여부"만 내려줍니다.
create view public.products_public as
  select
    id, name, subtitle, category, price,
    (stock > 0) as in_stock,
    images, colors, sizes, ingredients, usage_guide, description, created_at
  from public.products
  where is_active;

-- ---------------------------------------------------------------------
-- 찜 목록 / 배송지
-- ---------------------------------------------------------------------
create table public.wishlist (
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label      text not null default '배송지',
  recipient  text not null check (length(trim(recipient)) > 0),
  phone      text not null check (phone ~ '^01[016789]-?[0-9]{3,4}-?[0-9]{4}$'),
  zip        text not null check (zip ~ '^[0-9]{5}$'),
  address1   text not null check (length(trim(address1)) > 0),
  address2   text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_idx on public.addresses (user_id);

-- 기본 배송지는 항상 하나만, 첫 배송지는 자동으로 기본이 됩니다.
create or replace function public.addresses_single_default()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' and not exists (select 1 from public.addresses where user_id = new.user_id) then
    new.is_default := true;
  end if;
  if new.is_default then
    update public.addresses set is_default = false
     where user_id = new.user_id and id <> new.id and is_default;
  end if;
  return new;
end;
$$;

create trigger addresses_before_write
  before insert or update on public.addresses
  for each row execute function public.addresses_single_default();

-- 기본 배송지를 지우면 가장 오래된 배송지가 기본이 됩니다.
create or replace function public.addresses_after_delete()
returns trigger
language plpgsql
as $$
begin
  if old.is_default then
    update public.addresses set is_default = true
     where id = (select id from public.addresses where user_id = old.user_id order by created_at limit 1);
  end if;
  return old;
end;
$$;

create trigger addresses_after_delete
  after delete on public.addresses
  for each row execute function public.addresses_after_delete();

-- ---------------------------------------------------------------------
-- 주문 / 주문 상품
--  * 회원이 탈퇴해도 주문 기록은 남도록 user_id 는 null 로만 바뀝니다.
--    (법적 보관 기간은 OPEN_ITEMS.md 에서 확인할 항목으로 관리)
-- ---------------------------------------------------------------------
create table public.orders (
  id           text primary key,
  user_id      uuid references auth.users (id) on delete set null,
  status       text not null default '주문 접수'
               check (status in ('주문 접수', '결제 완료', '배송 준비중', '배송중', '배송 완료', '취소')),
  subtotal     integer not null check (subtotal >= 0),
  shipping_fee integer not null check (shipping_fee >= 0),
  amount       integer not null check (amount >= 0),
  recipient    text not null,
  phone        text not null,
  zip          text not null,
  address1     text not null,
  address2     text not null default '',
  memo         text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null references public.orders (id) on delete cascade,
  product_id    text references public.products (id) on delete set null,
  name          text not null,
  price         integer not null check (price >= 0),
  quantity      integer not null check (quantity > 0),
  thumbnail_url text,
  color         text,
  size          text
);

create index order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------
-- 후기 (구매자만, 배송 완료 후, 주문 1건당 1개)
-- ---------------------------------------------------------------------
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   text not null references public.products (id) on delete cascade,
  user_id      uuid references auth.users (id) on delete set null,
  order_id     text references public.orders (id) on delete set null,
  author_name  text not null default '',
  rating       smallint not null check (rating between 1 and 5),
  content      text not null check (length(trim(content)) > 0),
  option_label text not null default '',
  images       text[] not null default '{}' check (cardinality(images) <= 3),
  is_hidden    boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (order_id, product_id)
);

create index reviews_product_idx on public.reviews (product_id, created_at desc);

-- 작성자·이름·숨김 여부는 서버가 정합니다 (브라우저가 마음대로 못 정해요).
create or replace function public.reviews_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  new.author_name := public.mask_name((select name from public.profiles where id = auth.uid()));
  new.is_hidden := false;
  return new;
end;
$$;

create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function public.reviews_before_insert();

-- ---------------------------------------------------------------------
-- Q&A
-- ---------------------------------------------------------------------
create table public.questions (
  id          uuid primary key default gen_random_uuid(),
  product_id  text references public.products (id) on delete set null,
  user_id     uuid references auth.users (id) on delete set null,
  author_name text not null default '',
  title       text not null check (length(trim(title)) > 0),
  content     text not null check (length(trim(content)) > 0),
  is_secret   boolean not null default false,
  images      text[] not null default '{}' check (cardinality(images) <= 3),
  answer      text,
  answered_at timestamptz,
  created_at  timestamptz not null default now()
);

create index questions_product_idx on public.questions (product_id, created_at desc);

create or replace function public.questions_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  new.author_name := public.mask_name((select name from public.profiles where id = auth.uid()));
  new.answer := null;
  new.answered_at := null;
  return new;
end;
$$;

create trigger questions_before_insert
  before insert on public.questions
  for each row execute function public.questions_before_insert();

-- 목록용 뷰: 비밀글은 작성자와 관리자만 내용을 볼 수 있고, 다른 사람에게는 "비밀글입니다."만 보입니다.
create view public.questions_feed as
  select
    b.id,
    b.product_id,
    b.author_name,
    b.is_secret,
    b.created_at,
    b.visible as can_view,
    b.mine as is_mine,
    (b.answer is not null) as is_answered,
    case when b.visible then b.title else '비밀글입니다.' end as title,
    case when b.visible then b.content else '' end as content,
    case when b.visible then b.images else '{}'::text[] end as images,
    case when b.visible then b.answer else null end as answer,
    case when b.visible then b.answered_at else null end as answered_at
  from (
    select
      q.*,
      (auth.uid() is not null and q.user_id = auth.uid()) as mine,
      (not q.is_secret or (auth.uid() is not null and q.user_id = auth.uid()) or public.is_admin()) as visible
    from public.questions q
  ) b;

-- 공개 질문에 붙은 사진인지 확인 (사진 저장소 정책에서 사용).
-- questions 표는 RLS 때문에 남의 글이 안 보이므로, 이 확인만 따로 함수로 합니다.
create or replace function public.is_public_question_photo(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.questions q where not q.is_secret and p_name = any (q.images)
  )
$$;

-- ---------------------------------------------------------------------
-- 주문 만들기: 가격·옵션·재고·배송비를 DB가 직접 계산합니다.
-- ---------------------------------------------------------------------
create or replace function public.option_extra(p_options jsonb, p_name text)
returns integer
language sql
immutable
as $$
  select coalesce((e ->> 'extra')::integer, 0)
  from jsonb_array_elements(p_options) as e
  where e ->> 'name' = p_name
  limit 1
$$;

create or replace function public.option_exists(p_options jsonb, p_name text)
returns boolean
language sql
immutable
as $$
  select exists (select 1 from jsonb_array_elements(p_options) as e where e ->> 'name' = p_name)
$$;

create or replace function public.place_order(p_items jsonb, p_address jsonb, p_memo text default '')
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_item      jsonb;
  v_product   public.products;
  v_qty       integer;
  v_color     text;
  v_size      text;
  v_unit      integer;
  v_subtotal  integer := 0;
  v_lines     jsonb := '[]'::jsonb;
  v_fee_cfg   jsonb;
  v_fee       integer;
  v_free_from integer;
  v_shipping  integer;
  v_order     public.orders;
  v_order_id  text;
  v_try       integer := 0;
  v_recipient text := trim(coalesce(p_address ->> 'recipient', ''));
  v_phone     text := trim(coalesce(p_address ->> 'phone', ''));
  v_zip       text := trim(coalesce(p_address ->> 'zip', ''));
  v_addr1     text := trim(coalesce(p_address ->> 'address1', ''));
  v_addr2     text := trim(coalesce(p_address ->> 'address2', ''));
  v_short     record;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'too_many_items';
  end if;

  if v_recipient = '' or v_addr1 = '' or v_zip !~ '^[0-9]{5}$' or v_phone !~ '^01[016789]-?[0-9]{3,4}-?[0-9]{4}$' then
    raise exception 'invalid_address';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty   := coalesce((v_item ->> 'quantity')::integer, 0);
    v_color := nullif(trim(coalesce(v_item ->> 'color', '')), '');
    v_size  := nullif(trim(coalesce(v_item ->> 'size', '')), '');

    if v_qty < 1 or v_qty > 99 then
      raise exception 'invalid_quantity';
    end if;

    select * into v_product from public.products
     where id = (v_item ->> 'product_id') and is_active;
    if not found then
      raise exception 'product_unavailable';
    end if;

    -- 옵션이 있는 상품은 옵션을 꼭 골라야 하고, 없는 상품에는 옵션을 붙일 수 없어요.
    if jsonb_array_length(v_product.colors) > 0 then
      if v_color is null or not public.option_exists(v_product.colors, v_color) then
        raise exception 'invalid_option:%', v_product.name;
      end if;
    elsif v_color is not null then
      raise exception 'invalid_option:%', v_product.name;
    end if;

    if jsonb_array_length(v_product.sizes) > 0 then
      if v_size is null or not public.option_exists(v_product.sizes, v_size) then
        raise exception 'invalid_option:%', v_product.name;
      end if;
    elsif v_size is not null then
      raise exception 'invalid_option:%', v_product.name;
    end if;

    v_unit := v_product.price
              + case when v_color is null then 0 else public.option_extra(v_product.colors, v_color) end
              + case when v_size  is null then 0 else public.option_extra(v_product.sizes,  v_size)  end;

    v_subtotal := v_subtotal + v_unit * v_qty;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'price', v_unit,
      'quantity', v_qty,
      'thumbnail_url', v_product.images[1],
      'color', v_color,
      'size', v_size
    ));
  end loop;

  -- 같은 상품이 여러 줄이어도 합쳐서 재고를 확인합니다.
  select p.name into v_short
  from (
    select (l ->> 'product_id') as pid, sum((l ->> 'quantity')::integer) as qty
    from jsonb_array_elements(v_lines) as l
    group by 1
  ) need
  join public.products p on p.id = need.pid
  where p.stock < need.qty
  limit 1;
  if found then
    raise exception 'out_of_stock:%', v_short.name;
  end if;

  select value into v_fee_cfg from public.shop_settings where key = 'shipping';
  v_fee       := coalesce((v_fee_cfg ->> 'fee')::integer, 3000);
  v_free_from := coalesce((v_fee_cfg ->> 'free_threshold')::integer, 50000);
  v_shipping  := case when v_subtotal >= v_free_from then 0 else v_fee end;

  loop
    v_try := v_try + 1;
    v_order_id := 'OR-' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-'
                  || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    begin
      insert into public.orders (id, user_id, subtotal, shipping_fee, amount, recipient, phone, zip, address1, address2, memo)
      values (v_order_id, v_uid, v_subtotal, v_shipping, v_subtotal + v_shipping,
              v_recipient, v_phone, v_zip, v_addr1, v_addr2, left(coalesce(p_memo, ''), 200))
      returning * into v_order;
      exit;
    exception when unique_violation then
      if v_try >= 5 then raise; end if;
    end;
  end loop;

  insert into public.order_items (order_id, product_id, name, price, quantity, thumbnail_url, color, size)
  select v_order.id, l.product_id, l.name, l.price, l.quantity, l.thumbnail_url, l.color, l.size
  from jsonb_to_recordset(v_lines) as l(product_id text, name text, price integer, quantity integer, thumbnail_url text, color text, size text);

  return v_order;
end;
$$;

-- 회원 탈퇴: 로그인 정보·배송지·찜은 지우고, 주문 기록은 남깁니다(user_id 만 비워짐).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- ---------------------------------------------------------------------
-- RLS (행 단위 보안)
-- ---------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.shop_settings enable row level security;
alter table public.products      enable row level security;
alter table public.wishlist      enable row level security;
alter table public.addresses     enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.reviews       enable row level security;
alter table public.questions     enable row level security;

-- profiles: 본인과 관리자만 조회, 본인만 이름·전화·수신동의 수정 (role 은 못 바꿔요)
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- shop_settings: 누구나 읽기, 관리자만 수정
create policy settings_select on public.shop_settings for select to anon, authenticated using (true);
create policy settings_admin_write on public.shop_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- products: 원본 테이블(재고 포함)은 관리자만. 고객은 products_public 뷰를 씁니다.
create policy products_admin_all on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- wishlist / addresses: 본인 것만
create policy wishlist_own on public.wishlist for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy addresses_own on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders: 본인 주문 조회, 관리자는 전체 조회·상태 변경. 생성은 place_order() 로만.
create policy orders_select on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy orders_admin_update on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy order_items_select on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and (o.user_id = auth.uid() or public.is_admin())
  ));

-- reviews: 숨김 처리되지 않은 후기는 누구나, 작성은 "배송 완료된 내 주문의 그 상품"일 때만
create policy reviews_select on public.reviews for select to anon, authenticated
  using (not is_hidden or public.is_admin() or user_id = auth.uid());
create policy reviews_insert on public.reviews for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.orders o
      join public.order_items i on i.order_id = o.id
      where o.id = reviews.order_id
        and o.user_id = auth.uid()
        and o.status = '배송 완료'
        and i.product_id = reviews.product_id
    )
  );
create policy reviews_admin_update on public.reviews for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- questions: 원본은 작성자·관리자만. 목록은 questions_feed 뷰를 씁니다.
create policy questions_select on public.questions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy questions_insert on public.questions for insert to authenticated
  with check (user_id = auth.uid());
create policy questions_admin_update on public.questions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 권한(GRANT): 일단 전부 회수하고, 필요한 것만 다시 열어줍니다.
-- ---------------------------------------------------------------------
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant select on public.products_public, public.questions_feed, public.shop_settings to anon, authenticated;
grant select on public.reviews to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, phone, marketing_consent) on public.profiles to authenticated;

grant insert, update, delete, select on public.products, public.shop_settings to authenticated;

grant select, insert, delete on public.wishlist to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;

grant select on public.orders, public.order_items to authenticated;
grant update (status) on public.orders to authenticated;

grant insert (product_id, order_id, rating, content, option_label, images) on public.reviews to authenticated;
grant update (is_hidden) on public.reviews to authenticated;

grant select on public.questions to authenticated;
grant insert (product_id, title, content, is_secret, images) on public.questions to authenticated;
grant update (answer, answered_at) on public.questions to authenticated;

-- 정책·뷰 안에서 쓰는 함수와, 브라우저에서 부르는 함수
grant execute on function public.is_admin()   to anon, authenticated;
grant execute on function public.mask_name(text) to anon, authenticated;
grant execute on function public.is_public_question_photo(text) to authenticated;
grant execute on function public.place_order(jsonb, jsonb, text) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------
-- 사진 저장소 (Storage)
--  public-images  : 상품 사진·후기 사진 (누구나 볼 수 있음)
--  question-photos: Q&A 첨부 사진 (비공개, 허용된 사람에게만 임시 주소 발급)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-images',   'public-images',   true,  5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('question-photos', 'question-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy public_images_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-images');

create policy public_images_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'public-images'
    and (
      (name like ('reviews/' || auth.uid()::text || '/%'))
      or (name like 'products/%' and public.is_admin())
    )
  );

create policy public_images_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'public-images'
    and (name like ('reviews/' || auth.uid()::text || '/%') or public.is_admin())
  );

create policy question_photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'question-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy question_photos_read on storage.objects for select to authenticated
  using (
    bucket_id = 'question-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or public.is_public_question_photo(name)
    )
  );
