"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from "@/lib/hooks"
import { resendSignupEmail, signIn } from "@/lib/db/auth"
import { toKoreanError } from "@/lib/db/errors"
import { isEmail, safeNext } from "@/lib/format"
import { isSupabaseConfigured } from "@/lib/supabase/config"

const URL_ERRORS: Record<string, string> = {
  confirm: "인증 링크가 만료됐거나 이미 사용됐어요. 이미 인증을 마쳤다면 바로 로그인해 보세요.",
  not_configured: "서버가 아직 연결되지 않았어요.",
}

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeNext(params.get("next"))
  const { hydrated, user } = useUser()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(URL_ERRORS[params.get("error") ?? ""] ?? null)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const [notice, setNotice] = useState<string | null>(params.get("reset") === "1" ? "비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요." : null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (hydrated && user) router.replace(next)
  }, [hydrated, user, next, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNotice(null)
    setNeedsConfirm(false)
    if (!isEmail(email)) return setError("이메일 형식을 확인해 주세요.")
    if (!password) return setError("비밀번호를 입력해 주세요.")

    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
      router.push(next)
    } catch (err) {
      const message = toKoreanError(err, "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.")
      setError(message)
      setNeedsConfirm(message.includes("이메일 인증"))
    } finally {
      setBusy(false)
    }
  }

  async function handleResend() {
    try {
      await resendSignupEmail(email, next)
      setNotice("인증 메일을 다시 보냈어요. 메일함(스팸함 포함)을 확인해 주세요.")
      setError(null)
      setNeedsConfirm(false)
    } catch (err) {
      setError(toKoreanError(err))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {!isSupabaseConfigured && (
        <p role="status" className="rounded-xl border border-brown/30 bg-paper p-4 text-sm">
          서버가 아직 연결되지 않아 로그인할 수 없어요.
        </p>
      )}

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

      {notice && (
        <p role="status" className="text-sm font-medium">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="field-error">
          {error}
          {needsConfirm && (
            <>
              {" "}
              <button type="button" onClick={handleResend} className="underline underline-offset-4">
                인증 메일 다시 받기
              </button>
            </>
          )}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-4" disabled={busy || !isSupabaseConfigured}>
        {busy ? "로그인 중…" : "로그인"}
      </button>

      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="underline underline-offset-4">
          비밀번호를 잊으셨나요?
        </Link>
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-medium underline underline-offset-4">
          회원가입
        </Link>
      </div>
    </form>
  )
}
