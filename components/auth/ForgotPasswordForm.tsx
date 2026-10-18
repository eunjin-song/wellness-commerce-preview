"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { requestPasswordReset } from "@/lib/db/auth"
import { toKoreanError } from "@/lib/db/errors"
import { isEmail } from "@/lib/format"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export default function ForgotPasswordForm() {
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(
    params.get("error") === "expired" ? "링크가 만료됐거나 이미 사용됐어요. 비밀번호 재설정 메일을 다시 받아 주세요." : null
  )
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmail(email)) return setError("이메일 형식을 확인해 주세요.")

    setBusy(true)
    setError(null)
    try {
      await requestPasswordReset(email)
      setSentTo(email.trim())
    } catch (err) {
      setError(toKoreanError(err, "메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요."))
    } finally {
      setBusy(false)
    }
  }

  if (sentTo) {
    return (
      <div className="space-y-4 rounded-2xl bg-paper p-6 text-sm leading-relaxed" role="status">
        <p className="font-display text-2xl">메일을 보냈어요</p>
        {/* 가입 여부를 알려주지 않도록, 가입된 이메일이든 아니든 같은 문구를 보여줍니다. */}
        <p>
          <b>{sentTo}</b>이(가) 가입된 이메일이라면 비밀번호를 다시 만드는 링크를 보냈어요. 메일함(스팸함 포함)을 확인해 주세요.
        </p>
        <Link href="/login" className="inline-block underline underline-offset-4">
          로그인 화면으로
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="text-sm">가입할 때 쓴 이메일을 입력하면, 비밀번호를 다시 만드는 링크를 보내드려요.</p>

      <div>
        <label htmlFor="forgot-email" className="field-label">
          이메일
        </label>
        <input id="forgot-email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-4" disabled={busy || !isSupabaseConfigured}>
        {busy ? "보내는 중…" : "재설정 링크 받기"}
      </button>

      <p className="text-center text-sm">
        <Link href="/login" className="underline underline-offset-4">
          로그인으로 돌아가기
        </Link>
      </p>
    </form>
  )
}
