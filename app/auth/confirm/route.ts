import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { safeNext } from "@/lib/format"

/**
 * 이메일 속 링크(가입 인증·비밀번호 재설정·이메일 변경)가 도착하는 곳.
 * 링크를 확인하고 로그인 세션을 만든 뒤, 알맞은 화면으로 보내줍니다.
 * - token_hash 방식: 다른 기기·메일 앱에서 열어도 동작합니다 (이메일 템플릿을 supabase/email-templates 대로 바꿨을 때)
 * - code 방식: Supabase 기본 템플릿을 그대로 쓸 때
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"), "/")

  const supabase = await createServerSupabase()
  if (!supabase) return NextResponse.redirect(`${origin}/login?error=not_configured`)

  let ok = false
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    ok = !error
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    ok = !error
  }

  if (!ok) {
    // 다른 브라우저에서 열었거나 링크가 만료된 경우: 이미 인증은 끝났을 수 있어서 로그인으로 안내합니다.
    const target = type === "recovery" ? "/forgot-password?error=expired" : "/login?error=confirm"
    return NextResponse.redirect(`${origin}${target}`)
  }

  const separator = next.includes("?") ? "&" : "?"
  const welcome = type === "signup" || type === "email" || type === "email_change" ? `${separator}verified=1` : ""
  return NextResponse.redirect(`${origin}${next}${welcome}`)
}
