import { requireClient } from "@/lib/supabase/client"

/**
 * 로그인·가입·비밀번호 관련 동작 (Supabase Auth).
 * 에러는 그대로 던지고, 화면에서 toKoreanError() 로 바꿔 보여줍니다.
 */

/** 이메일 속 링크가 돌아올 주소 (Supabase 대시보드의 Redirect URLs 에 등록돼 있어야 해요) */
function confirmUrl(next: string) {
  return `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`
}

export async function signUp(input: { name: string; email: string; password: string; phone: string; marketingConsent: boolean; next: string }) {
  const { data, error } = await requireClient().auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: confirmUrl(input.next),
      data: { name: input.name.trim(), phone: input.phone.trim(), marketing_consent: input.marketingConsent },
    },
  })
  if (error) throw error

  // 이미 가입된 이메일이면 Supabase 는 보안상 에러 대신 "identities 가 빈 사용자"를 돌려줍니다.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error("User already registered")
  }
  /** 이메일 인증을 켜 두면 session 이 비어 있어요 (인증 메일을 확인해야 로그인됨) */
  return { needsEmailConfirmation: data.session === null }
}

export async function signIn(email: string, password: string) {
  const { error } = await requireClient().auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
}

export async function signOut() {
  const { error } = await requireClient().auth.signOut()
  if (error) throw error
}

export async function resendSignupEmail(email: string, next = "/") {
  const { error } = await requireClient().auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: confirmUrl(next) },
  })
  if (error) throw error
}

/** 비밀번호 재설정 링크 메일 보내기 */
export async function requestPasswordReset(email: string) {
  const { error } = await requireClient().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: confirmUrl("/reset-password"),
  })
  if (error) throw error
}

/** 재설정 링크로 들어온 상태(또는 로그인 상태)에서 새 비밀번호로 바꾸기 */
export async function setNewPassword(password: string) {
  const { error } = await requireClient().auth.updateUser({ password })
  if (error) throw error
}

/** 로그인 상태에서 비밀번호 바꾸기: 현재 비밀번호를 먼저 확인합니다. */
export async function changePassword(email: string, currentPassword: string, newPassword: string) {
  const supabase = requireClient()
  const check = await supabase.auth.signInWithPassword({ email, password: currentPassword })
  if (check.error) throw new Error("Invalid login credentials")
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

/** 이메일 변경: 새 이메일로 확인 메일이 가고, 링크를 눌러야 실제로 바뀝니다. */
export async function changeEmail(newEmail: string) {
  const { error } = await requireClient().auth.updateUser(
    { email: newEmail.trim() },
    { emailRedirectTo: confirmUrl("/mypage/profile") }
  )
  if (error) throw error
}

export async function updateProfile(userId: string, patch: { name: string; phone: string; marketingConsent: boolean }) {
  const { error } = await requireClient()
    .from("profiles")
    .update({ name: patch.name, phone: patch.phone, marketing_consent: patch.marketingConsent })
    .eq("id", userId)
  if (error) throw error
}

/** 회원 탈퇴: 로그인 정보·배송지·찜은 삭제되고, 주문 기록은 남습니다. */
export async function deleteMyAccount() {
  const supabase = requireClient()
  const { error } = await supabase.rpc("delete_my_account")
  if (error) throw error
  await supabase.auth.signOut()
}
