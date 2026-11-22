-- =====================================================================
-- 0005: 상품 노출 순서 + 할인 정보(정가) + 홈 대표 상품
--
--  * products.sort_order    : 홈·전체 상품 화면에 보이는 순서 (작을수록 먼저). 관리자가 바꿀 수 있어요.
--  * products.original_price: 할인 전 가격(정가). 비워두면 할인 표시를 하지 않아요.
--                             정가가 판매가(price)보다 클 때만 입력할 수 있고, 화면에는 취소선과 할인율로 보여요.
--  * reorder_products()     : 관리자가 순서를 한 번에 바꾸는 함수 (일반 회원은 못 써요)
--  * shop_settings 'home_featured': 홈 화면 상단에 크게 보여줄 대표 상품 id 목록 (관리자가 고름)
--
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run. (한 번만)
-- =====================================================================

alter table public.products add column sort_order integer not null default 0;
alter table public.products add column original_price integer;
alter table public.products add constraint products_original_price_check
  check (original_price is null or original_price > price);

-- 이미 있는 상품은 등록한 순서대로 1, 2, 3 ... 으로 번호를 매겨요.
update public.products p
   set sort_order = s.rn
  from (select id, row_number() over (order by created_at, id) as rn from public.products) s
 where p.id = s.id;

-- 새 상품은 자동으로 맨 뒤에 붙어요.
create or replace function public.products_set_sort_order()
returns trigger
language plpgsql
as $$
begin
  if new.sort_order = 0 then
    new.sort_order := coalesce((select max(sort_order) from public.products), 0) + 1;
  end if;
  return new;
end;
$$;

create trigger products_before_insert
  before insert on public.products
  for each row execute function public.products_set_sort_order();

-- 고객에게 보여주는 상품 뷰에 순서와 정가를 추가합니다. (재고 숫자는 여전히 없어요)
create or replace view public.products_public as
  select
    id, name, subtitle, category, price,
    (stock > 0) as in_stock,
    images, colors, sizes, ingredients, usage_guide, description, created_at,
    sort_order, original_price
  from public.products
  where is_active;

-- 관리자가 상품 순서를 바꿉니다: 받은 id 목록의 순서대로 1, 2, 3 ... 을 매겨요.
create or replace function public.reorder_products(p_ids text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  update public.products p
     set sort_order = u.ord
    from unnest(p_ids) with ordinality as u(id, ord)
   where p.id = u.id;
end;
$$;

revoke all on function public.reorder_products(text[]) from public, anon;
grant execute on function public.reorder_products(text[]) to authenticated;

-- 홈 화면 대표 상품 (처음에는 비어 있어요. 비어 있으면 앞의 두 상품을 보여줘요)
insert into public.shop_settings (key, value)
values ('home_featured', '{"ids": []}'::jsonb)
on conflict (key) do nothing;
