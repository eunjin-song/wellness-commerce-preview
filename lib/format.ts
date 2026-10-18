export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`

/** 로컬 시간 기준 YYYY-MM-DD */
export const today = () => new Date().toLocaleDateString("sv-SE")

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function maskName(name: string) {
  const n = name.trim()
  if (n.length <= 1) return n
  if (n.length === 2) return n[0] + "*"
  return n[0] + "*".repeat(n.length - 2) + n[n.length - 1]
}

export function orderNumber() {
  const d = new Date().toLocaleDateString("sv-SE").replaceAll("-", "")
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `OR-${d}-${tail}`
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export const isPhone = (v: string) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, ""))

/** 로그인 후 돌아갈 주소가 사이트 내부 경로인지 확인 */
export function safeNext(next: string | null | undefined, fallback = "/mypage") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback
  return next
}
