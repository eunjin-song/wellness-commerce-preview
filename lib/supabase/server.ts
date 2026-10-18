import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config"

/** 로그인 세션(쿠키)을 읽고 쓰는 서버용 클라이언트. 이메일 인증 링크 처리에 사용합니다. */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없어요. 세션 갱신은 브라우저가 대신하므로 무시해도 됩니다.
        }
      },
    },
  })
}

/**
 * 로그인과 무관한 공개 데이터(상품 등)용. 쿠키를 읽지 않아서 페이지를 캐시할 수 있어요.
 * 공개 뷰만 읽을 수 있는 권한이라, 비회원과 똑같이 동작합니다.
 */
export function createPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
