-- =====================================================================
-- 0008: IR(공고·공시) 게시판
--
--  * ir_posts      : 공고·공시 글. 누구나 '공개' 글을 읽고, 글쓰기·수정·삭제·숨김은 관리자만 해요.
--  * 번호(Number)는 저장하지 않아요. 공개된 글을 최신순으로 세어서 화면에서 매겨요(100, 99, 98 ...).
--  * increment_ir_views : 글을 열면 조회수를 1 올려요. (공개 글만, 방문자도 호출 가능)
--  * ir-files 저장소    : 공시 첨부파일(PDF·이미지). 누구나 읽고, 올리기·지우기는 관리자만 해요.
--      - 파일 주소를 아는 사람은 누구나 열 수 있어요. 숨김 글의 파일도 주소를 알면 열리니,
--        공개하면 안 되는 문서는 올리지 마세요. (주소는 추측할 수 없는 무작위 이름이에요)
--
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run. (한 번만)
-- =====================================================================

create table public.ir_posts (
  id           bigint generated always as identity primary key,
  title        text not null check (length(trim(title)) > 0),
  author       text not null default 'ooro.' check (length(trim(author)) > 0),
  content      text not null default '',
  file_path    text,
  file_name    text,
  published_at date not null default ((now() at time zone 'Asia/Seoul')::date),
  is_published boolean not null default true,
  views        integer not null default 0 check (views >= 0),
  created_at   timestamptz not null default now()
);

create index ir_posts_list_idx on public.ir_posts (published_at desc, id desc);

alter table public.ir_posts enable row level security;

-- 공개된 글은 누구나, 숨김 글은 관리자만 읽어요.
create policy ir_posts_select on public.ir_posts for select to anon, authenticated
  using (is_published or public.is_admin());
-- 글쓰기·수정·삭제는 관리자만
create policy ir_posts_admin_write on public.ir_posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.ir_posts from anon, authenticated;
grant select on public.ir_posts to anon, authenticated;
grant insert, update, delete on public.ir_posts to authenticated;

-- 조회수 올리기: 공개 글만, 표를 직접 고치지 못하는 방문자도 이 함수로만 올릴 수 있어요.
create or replace function public.increment_ir_views(p_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ir_posts set views = views + 1 where id = p_id and is_published
$$;

revoke all on function public.increment_ir_views(bigint) from public;
grant execute on function public.increment_ir_views(bigint) to anon, authenticated;

-- 첨부파일 저장소 (PDF·이미지, 파일당 20MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ir-files', 'ir-files', true, 20971520, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy ir_files_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'ir-files');
create policy ir_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'ir-files' and public.is_admin());
create policy ir_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'ir-files' and public.is_admin());
