-- 0002: 로그인하지 않은 방문자도 '공개 질문'에 붙은 사진은 볼 수 있게 합니다.
--
-- 왜 필요한가요?
--  Q&A 게시판(questions_feed)은 로그인하지 않은 방문자도 읽을 수 있는데,
--  사진 저장소의 읽기 규칙이 '로그인한 회원'에게만 열려 있어서
--  방문자에게는 공개 질문의 사진만 비어 보였어요. (2026-11-22 실제 서버 시험에서 발견)
--
-- 바뀌는 것
--  1) 사진이 공개 질문에 붙은 것인지 확인하는 함수를 방문자(anon)도 쓸 수 있게 허용
--  2) 사진 저장소 읽기 규칙을 방문자(anon)에게도 적용
-- 그대로인 것
--  - 비밀글 사진, 질문에 아직 붙지 않은 사진은 여전히 작성자 본인과 관리자만 볼 수 있어요.
--  - 사진 올리기(insert)는 여전히 로그인한 회원이 자기 폴더에만 할 수 있어요.

grant execute on function public.is_public_question_photo(text) to anon;

drop policy if exists question_photos_read on storage.objects;

create policy question_photos_read on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'question-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or public.is_public_question_photo(name)
    )
  );
