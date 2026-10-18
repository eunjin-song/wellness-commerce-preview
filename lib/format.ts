export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export const isPhone = (v: string) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, ""))

/** 영문과 숫자를 섞어 8자 이상 (가입·비밀번호 변경 공통 규칙) */
export const isStrongPassword = (v: string) => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)

/** 로그인 후 돌아갈 주소가 사이트 내부 경로인지 확인 */
export function safeNext(next: string | null | undefined, fallback = "/mypage") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback
  return next
}
