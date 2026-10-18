"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useUser } from "@/lib/hooks"
import { setNewPassword, signOut } from "@/lib/db/auth"
import { toKoreanError } from "@/lib/db/errors"
import { isStrongPassword } from "@/lib/format"

/** 이메일의 재설정 링크를 누르면 임시로 로그인된 상태로 이 화면에 옵니다. */
export default function ResetPasswordForm() {
  const router = useRouter()
  const { hydrated, user } = useUser()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!hydrated) return <p className="text-sm">확인하는 중이에요…</p>

  if (!user) {
    return (
      <div className="space-y-4 rounded-2xl bg-paper p-6 text-sm leading-relaxed" role="alert">
        <p className="font-medium">재설정 링크가 유효하지 않아요.</p>
        <p>링크가 만료됐거나 이미 사용됐을 수 있어요. 메일을 다시 받아 주세요.</p>
        <Link href="/forgot-password" className="btn-primary">
          재설정 메일 다시 받기
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isStrongPassword(password)) return setError("영문과 숫자를 포함해 8자 이상 입력해 주세요.")
    if (password !== confirm) return setError("비밀번호가 일치하지 않아요.")

    setBusy(true)
    setError(null)
    try {
      await setNewPassword(password)
      // 새 비밀번호로 다시 로그인하도록 한 번 로그아웃합니다.
      await signOut()
      router.replace("/login?reset=1")
    } catch (err) {
      setError(toKoreanError(err, "비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="text-sm">
        <b>{user.email}</b> 계정의 새 비밀번호를 정해 주세요.
      </p>

      <div>
        <label htmlFor="reset-password" className="field-label">
          새 비밀번호
        </label>
        <input id="reset-password" type="password" autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="영문+숫자 8자 이상" />
      </div>

      <div>
        <label htmlFor="reset-confirm" className="field-label">
          새 비밀번호 확인
        </label>
        <input id="reset-confirm" type="password" autoComplete="new-password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-4" disabled={busy}>
        {busy ? "변경 중…" : "비밀번호 변경"}
      </button>
    </form>
  )
}
