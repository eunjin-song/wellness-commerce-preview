import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config"

let client: SupabaseClient | null = null

/** 브라우저용 클라이언트 (로그인 세션은 쿠키에 저장됩니다). 연결 정보가 없으면 null. */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
  return client
}

/** 연결 정보가 반드시 있어야 하는 곳에서 사용 (없으면 사용자에게 보여줄 에러) */
export function requireClient(): SupabaseClient {
  const supabase = createClient()
  if (!supabase) throw new Error("not_configured")
  return supabase
}
