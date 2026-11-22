-- =====================================================================
-- 0006: 할인율 방식 가격
--
--  관리자는 "정가"와 "할인율(%)"만 입력하고, 실제 판매가는 DB가 자동으로 계산해요.
--    판매가 = 정가 × (100 − 할인율) ÷ 100 을 10원 단위로 내림   (예: 58,000원 · 15% → 49,300원)
--  * 할인율이 0이면 할인 없음: 판매가 = 입력한 가격(정가), 할인 표시도 없어요.
--  * 할인율이 있으면 정가(original_price)가 꼭 있어야 하고, products.price 에는 계산된 판매가가 들어가요.
--    (결제·장바구니·주문은 전부 products.price 를 써서, 고객은 항상 할인이 적용된 가격으로 사요)
--  * 계산은 DB가 하므로, 화면이 잘못된 판매가를 보내도 무시되고 항상 이 규칙대로 맞춰져요.
--
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run. (한 번만)
-- =====================================================================

alter table public.products add column discount_percent integer not null default 0
  check (discount_percent between 0 and 99);

-- 이미 정가가 입력돼 있던 상품은 현재 가격과의 차이로 할인율을 채워 둬요. (가격은 그대로)
update public.products
   set discount_percent = greatest(1, round((1 - price::numeric / original_price) * 100))::integer
 where original_price is not null and original_price > price;

-- 가격·정가·할인율이 바뀔 때 판매가를 다시 맞춰요. (재고만 바뀌는 주문 처리에서는 실행되지 않아요)
create or replace function public.products_apply_discount()
returns trigger
language plpgsql
as $$
begin
  if new.discount_percent > 0 then
    if new.original_price is null or new.original_price <= 0 then
      raise exception 'discount_needs_list_price';
    end if;
    new.price := (floor(new.original_price::numeric * (100 - new.discount_percent) / 1000) * 10)::integer;
  else
    new.original_price := null;
  end if;
  return new;
end;
$$;

create trigger products_apply_discount
  before insert or update of price, original_price, discount_percent on public.products
  for each row execute function public.products_apply_discount();

-- 고객에게 보여주는 상품 뷰에 할인율을 추가합니다. (재고 숫자는 여전히 없어요)
create or replace view public.products_public as
  select
    id, name, subtitle, category, price,
    (stock > 0) as in_stock,
    images, colors, sizes, ingredients, usage_guide, description, created_at,
    sort_order, original_price, discount_percent
  from public.products
  where is_active;
