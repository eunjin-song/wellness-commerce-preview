-- =====================================================================
-- 0003: 재고 차감 + 주문 취소(재고 되돌리기)
--
-- 규칙
--  1) 주문이 접수되는 즉시 상품 재고가 주문 수량만큼 줄어듭니다. (place_order 가 처리)
--  2) 재고가 모자라면 주문 전체가 취소됩니다. (동시에 주문해도 재고가 음수가 되지 않아요)
--  3) 주문이 '취소'가 되면(고객 취소 또는 관리자 변경) 재고가 되돌아옵니다.
--  4) 한 번 취소된 주문은 다른 상태로 되돌릴 수 없습니다. (재고가 두 번 줄거나 늘지 않게)
--  5) 이 규칙이 생기기 전에 접수된 주문은 재고가 줄지 않았으므로, 취소해도 재고를 늘리지 않습니다.
--
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run. (한 번만)
-- =====================================================================

-- 재고를 이미 줄인 주문인지 표시 (기존 주문은 false)
alter table public.orders add column stock_deducted boolean not null default false;

-- ---------------------------------------------------------------------
-- 주문 만들기: 가격·옵션·재고·배송비를 DB가 직접 계산하고, 재고를 줄입니다.
-- ---------------------------------------------------------------------
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
  v_need      record;
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

  -- 재고 차감: 같은 상품이 여러 줄이어도 합쳐서, 상품 순서대로(교착 방지) 한 번에 줄입니다.
  -- "재고가 충분할 때만" 줄이는 한 문장이라, 동시에 주문해도 재고가 음수가 되지 않아요.
  -- 하나라도 모자라면 예외가 나서 지금까지 줄인 것도 모두 되돌아갑니다.
  for v_need in
    select (l ->> 'product_id') as pid, sum((l ->> 'quantity')::integer)::integer as qty
    from jsonb_array_elements(v_lines) as l
    group by 1
    order by 1
  loop
    update public.products
       set stock = stock - v_need.qty
     where id = v_need.pid and stock >= v_need.qty;
    if not found then
      raise exception 'out_of_stock:%', (select name from public.products where id = v_need.pid);
    end if;
  end loop;

  select value into v_fee_cfg from public.shop_settings where key = 'shipping';
  v_fee       := coalesce((v_fee_cfg ->> 'fee')::integer, 3000);
  v_free_from := coalesce((v_fee_cfg ->> 'free_threshold')::integer, 50000);
  v_shipping  := case when v_subtotal >= v_free_from then 0 else v_fee end;

  loop
    v_try := v_try + 1;
    v_order_id := 'OR-' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-'
                  || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    begin
      insert into public.orders (id, user_id, subtotal, shipping_fee, amount, recipient, phone, zip, address1, address2, memo, stock_deducted)
      values (v_order_id, v_uid, v_subtotal, v_shipping, v_subtotal + v_shipping,
              v_recipient, v_phone, v_zip, v_addr1, v_addr2, left(coalesce(p_memo, ''), 200), true)
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

-- ---------------------------------------------------------------------
-- 주문 상태가 바뀔 때: '취소'가 되면 재고를 되돌리고, 취소된 주문은 되살릴 수 없게 합니다.
-- ---------------------------------------------------------------------
create or replace function public.orders_status_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = '취소' and new.status <> '취소' then
    raise exception 'order_cancelled';
  end if;

  if new.status = '취소' and old.status <> '취소' and old.stock_deducted then
    update public.products p
       set stock = p.stock + i.qty
      from (
        select product_id, sum(quantity)::integer as qty
        from public.order_items
        where order_id = new.id and product_id is not null
        group by product_id
      ) i
     where p.id = i.product_id;
  end if;

  return new;
end;
$$;

create trigger orders_status_guard
  before update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.orders_status_guard();

-- ---------------------------------------------------------------------
-- 고객이 직접 주문 취소: 내 주문 중 '주문 접수' 상태(아직 결제 전)만 가능합니다.
--  * 결제가 연결된 뒤의 취소·환불은 결제 연동 단계에서 함께 처리합니다.
-- ---------------------------------------------------------------------
create or replace function public.cancel_my_order(p_order_id text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_order from public.orders
   where id = p_order_id and user_id = auth.uid()
   for update;
  if not found then
    raise exception 'order_not_found';
  end if;

  if v_order.status <> '주문 접수' then
    raise exception 'cannot_cancel';
  end if;

  update public.orders set status = '취소' where id = v_order.id returning * into v_order;
  return v_order;
end;
$$;

revoke all on function public.orders_status_guard() from public, anon, authenticated;
revoke all on function public.cancel_my_order(text) from public, anon;
grant execute on function public.cancel_my_order(text) to authenticated;
