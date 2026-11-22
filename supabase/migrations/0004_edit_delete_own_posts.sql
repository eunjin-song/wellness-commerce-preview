-- =====================================================================
-- 0004: 후기·Q&A 본인 수정 / 삭제
--
--  * 후기: 본인이 쓴 후기의 별점·내용을 고치거나 지울 수 있어요. (숨김 처리는 관리자만)
--  * Q&A : 본인이 쓴 질문의 제목·내용·비밀글 여부를 고치거나 지울 수 있어요.
--          단, 관리자가 답변을 단 뒤에는 고칠 수 없어요(답변이 어긋나지 않게). 삭제는 언제든 가능해요.
--  * 본인 글에 붙인 사진은 글을 지울 때 함께 정리할 수 있어요.
--
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run. (한 번만)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 후기
-- ---------------------------------------------------------------------
create policy reviews_update_own on public.reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reviews_delete_own on public.reviews for delete to authenticated
  using (user_id = auth.uid());

grant update (rating, content) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;

-- 일반 회원은 '숨김' 여부를 바꿀 수 없어요. (컬럼 권한은 역할 단위라서 트리거로 한 번 더 막습니다)
create or replace function public.reviews_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.is_hidden := old.is_hidden;
  end if;
  return new;
end;
$$;

create trigger reviews_before_update
  before update on public.reviews
  for each row execute function public.reviews_before_update();

-- ---------------------------------------------------------------------
-- Q&A
-- ---------------------------------------------------------------------
create policy questions_update_own on public.questions for update to authenticated
  using (user_id = auth.uid() and answer is null) with check (user_id = auth.uid());
create policy questions_delete_own on public.questions for delete to authenticated
  using (user_id = auth.uid());

grant update (title, content, is_secret) on public.questions to authenticated;
grant delete on public.questions to authenticated;

-- 일반 회원은 답변을 달거나 바꿀 수 없어요. (관리자만)
create or replace function public.questions_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.answer := old.answer;
    new.answered_at := old.answered_at;
  end if;
  return new;
end;
$$;

create trigger questions_before_update
  before update on public.questions
  for each row execute function public.questions_before_update();

-- 본인이 올린 Q&A 사진은 본인이 지울 수 있어요.
create policy question_photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'question-photos' and (storage.foldername(name))[1] = auth.uid()::text);

revoke all on function public.reviews_before_update() from public, anon, authenticated;
revoke all on function public.questions_before_update() from public, anon, authenticated;
