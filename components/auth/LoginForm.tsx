"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useApp } from "@/lib/store/app"
import { useUser } from "@/lib/hooks"
import { isEmail, safeNext } from "@/lib/format"

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeNext(params.get("next"))
  const { hydrated, user } = useUser()
  const login = useApp((s) => s.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hydrated && user) router.replace(next)
  }, [hydrated, user, next, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmail(email)) return setError("이메일 형식을 확인해 주세요.")
    if (!password) return setError("비밀번호를 입력해 주세요.")

    const result = login(email)
    if (!result.ok) return setError(result.error)
    router.push(next)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="login-email" className="field-label">
          이메일
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="field-label">
          비밀번호
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-4">
        로그인
      </button>

      <p className="text-center text-sm">
        아직 회원이 아니신가요?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-medium underline underline-offset-4">
          회원가입
        </Link>
      </p>

      <p className="rounded-xl bg-paper p-4 text-xs leading-relaxed">
        미리보기 버전이에요. 가입 정보는 이 브라우저에만 저장되고, 비밀번호는 저장하거나 확인하지 않아요.
      </p>
    </form>
  )
}
