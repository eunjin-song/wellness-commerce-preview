"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useApp } from "@/lib/store/app"
import { useUser } from "@/lib/hooks"
import { isEmail, isPhone, safeNext } from "@/lib/format"

type Errors = Partial<Record<"name" | "email" | "password" | "confirm" | "phone" | "terms" | "form", string>>

export default function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeNext(params.get("next"), "/")
  const { hydrated, user } = useUser()
  const signup = useApp((s) => s.signup)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [phone, setPhone] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (hydrated && user) router.replace(next)
  }, [hydrated, user, next, router])

  const allAgreed = agreeTerms && agreePrivacy && agreeMarketing
  const toggleAll = (checked: boolean) => {
    setAgreeTerms(checked)
    setAgreePrivacy(checked)
    setAgreeMarketing(checked)
  }

  function validate(): Errors {
    const e: Errors = {}
    if (name.trim().length < 2) e.name = "이름을 2자 이상 입력해 주세요."
    if (!isEmail(email)) e.email = "이메일 형식을 확인해 주세요."
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
      e.password = "영문과 숫자를 포함해 8자 이상 입력해 주세요."
    if (confirm !== password) e.confirm = "비밀번호가 일치하지 않아요."
    if (phone && !isPhone(phone)) e.phone = "휴대폰 번호 형식을 확인해 주세요. (예: 010-1234-5678)"
    if (!agreeTerms || !agreePrivacy) e.terms = "필수 약관에 동의해 주세요."
    return e
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const result = signup({ name, email, phone, marketingConsent: agreeMarketing })
    if (!result.ok) return setErrors({ email: result.error })
    router.push(next)
  }

  const err = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`signup-${key}-error`} role="alert" className="field-error">
        {errors[key]}
      </p>
    ) : null
  const describe = (key: keyof Errors) => (errors[key] ? `signup-${key}-error` : undefined)

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="signup-name" className="field-label">
          이름
        </label>
        <input id="signup-name" autoComplete="name" className="field" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={describe("name")} />
        {err("name")}
      </div>

      <div>
        <label htmlFor="signup-email" className="field-label">
          이메일
        </label>
        <input id="signup-email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" aria-invalid={!!errors.email} aria-describedby={describe("email")} />
        {err("email")}
      </div>

      <div>
        <label htmlFor="signup-password" className="field-label">
          비밀번호
        </label>
        <input id="signup-password" type="password" autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="영문+숫자 8자 이상" aria-invalid={!!errors.password} aria-describedby={describe("password")} />
        {err("password")}
      </div>

      <div>
        <label htmlFor="signup-confirm" className="field-label">
          비밀번호 확인
        </label>
        <input id="signup-confirm" type="password" autoComplete="new-password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={!!errors.confirm} aria-describedby={describe("confirm")} />
        {err("confirm")}
      </div>

      <div>
        <label htmlFor="signup-phone" className="field-label">
          휴대폰 번호 <span className="font-normal">(선택)</span>
        </label>
        <input id="signup-phone" type="tel" autoComplete="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" aria-invalid={!!errors.phone} aria-describedby={describe("phone")} />
        {err("phone")}
      </div>

      <fieldset className="space-y-3 rounded-2xl bg-paper p-5 text-sm">
        <legend className="sr-only">약관 동의</legend>
        <label className="flex items-center gap-2 font-medium">
          <input type="checkbox" className="h-4 w-4 accent-brown" checked={allAgreed} onChange={(e) => toggleAll(e.target.checked)} />
          전체 동의
        </label>
        <hr className="border-brown/20" />
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-brown" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
          (필수) 이용약관 동의
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-brown" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
          (필수) 개인정보 수집·이용 동의
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-brown" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} />
          (선택) 이벤트·혜택 소식 수신 동의
        </label>
        {err("terms")}
      </fieldset>

      <button type="submit" className="btn-primary w-full py-4">
        가입하기
      </button>

      <p className="text-center text-sm">
        이미 회원이신가요?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium underline underline-offset-4">
          로그인
        </Link>
      </p>

      <p className="rounded-xl bg-paper p-4 text-xs leading-relaxed">
        미리보기 버전이에요. 가입 정보는 이 브라우저에만 저장되고, 비밀번호는 저장하지 않아요.
      </p>
    </form>
  )
}
