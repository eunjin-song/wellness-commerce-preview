-- =====================================================================
-- 0007: 카테고리 관리 (추가 · 이름 변경 · 삭제 · 순서 편집)
--
--  * categories 표가 카테고리 목록과 순서(sort_order)를 가져요. 고객 화면의 카테고리 탭이 이 순서로 나와요.
--  * 상품의 카테고리(products.category)는 이 목록에 있는 이름만 쓸 수 있어요. (빈 값 = 미분류)
--  * 이름 변경: 그 카테고리의 모든 상품도 함께 새 이름으로 바뀌어요.
--  * 삭제: 그 카테고리의 상품은 지워지지 않고 '미분류'가 돼요.
--  * 추가·이름 변경·삭제·순서 변경은 관리자만 할 수 있는 함수로만 가능해요. (일반 회원은 읽기만)
--
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run. (한 번만)
-- =====================================================================

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 같은 이름은 하나만 (대소문자·앞뒤 공백 무시)
create unique index categories_name_key on public.categories (lower(trim(name)));

alter table public.categories enable row level security;
create policy categories_select on public.categories for select to anon, authenticated using (true);

revoke all on public.categories from anon, authenticated;
grant select on public.categories to anon, authenticated;

-- 지금 상품들이 쓰고 있는 카테고리를 목록으로 옮기고, 상품이 나오던 순서대로 번호를 매겨요.
insert into public.categories (name, sort_order)
select category, row_number() over (order by min(sort_order), category)
  from public.products
 where trim(category) <> ''
 group by category;

-- 상품의 카테고리는 목록에 있는 이름(또는 빈 값)만 쓸 수 있어요.
create or replace function public.products_check_category()
returns trigger
language plpgsql
as $$
begin
  if new.category <> '' and not exists (select 1 from public.categories c where c.name = new.category) then
    raise exception 'invalid_category';
  end if;
  return new;
end;
$$;

create trigger products_check_category
  before insert or update of category on public.products
  for each row execute function public.products_check_category();

-- ---------------------------------------------------------------------
-- 관리자 전용 함수
-- ---------------------------------------------------------------------
create or replace function public.add_category(p_name text)
returns public.categories
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_row  public.categories;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if v_name = '' then
    raise exception 'category_name_required';
  end if;
  if exists (select 1 from public.categories where lower(trim(name)) = lower(v_name)) then
    raise exception 'category_exists';
  end if;

  insert into public.categories (name, sort_order)
  values (v_name, coalesce((select max(sort_order) from public.categories), 0) + 1)
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.rename_category(p_id uuid, p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_old  text;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if v_name = '' then
    raise exception 'category_name_required';
  end if;

  select name into v_old from public.categories where id = p_id for update;
  if not found then
    raise exception 'category_not_found';
  end if;
  if exists (select 1 from public.categories where id <> p_id and lower(trim(name)) = lower(v_name)) then
    raise exception 'category_exists';
  end if;

  update public.categories set name = v_name where id = p_id;
  update public.products set category = v_name where category = v_old;
end;
$$;

-- 삭제하고, 그 카테고리였던 상품 수를 돌려줘요. (상품은 '미분류'가 돼요)
create or replace function public.delete_category(p_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name  text;
  v_moved integer;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  select name into v_name from public.categories where id = p_id for update;
  if not found then
    raise exception 'category_not_found';
  end if;

  update public.products set category = '' where category = v_name;
  get diagnostics v_moved = row_count;
  delete from public.categories where id = p_id;
  return v_moved;
end;
$$;

-- 받은 id 목록의 순서대로 1, 2, 3 ... 번호를 매겨요.
create or replace function public.reorder_categories(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  update public.categories c
     set sort_order = u.ord
    from unnest(p_ids) with ordinality as u(id, ord)
   where c.id = u.id;
end;
$$;

revoke all on function public.add_category(text) from public, anon;
revoke all on function public.rename_category(uuid, text) from public, anon;
revoke all on function public.delete_category(uuid) from public, anon;
revoke all on function public.reorder_categories(uuid[]) from public, anon;
grant execute on function public.add_category(text) to authenticated;
grant execute on function public.rename_category(uuid, text) to authenticated;
grant execute on function public.delete_category(uuid) to authenticated;
grant execute on function public.reorder_categories(uuid[]) to authenticated;
