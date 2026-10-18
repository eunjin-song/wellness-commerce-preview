/**
 * Supabase 연결 정보 (.env.local / Vercel 환경 변수).
 * 둘 다 "공개해도 되는 값"이에요. 데이터 보호는 DB의 RLS 규칙이 합니다.
 * (비밀 키인 service_role 키는 이 프로젝트에서 쓰지 않습니다.)
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

export const isSupabaseConfigured = SUPABASE_URL.startsWith("http") && SUPABASE_KEY.length > 20

/** 사진 저장소 이름 */
export const PUBLIC_BUCKET = "public-images"
export const QUESTION_BUCKET = "question-photos"
