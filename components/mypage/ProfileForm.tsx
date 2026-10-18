"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/lib/hooks"
import { changeEmail, changePassword, deleteMyAccount, signOut, updateProfile } from "@/lib/db/auth"
import { toKoreanError } from "@/lib/db/errors"
import { isEmail, isPhone, isStrongPassword } from "@/lib/format"

type ProfileErrors = Partial<Record<"name" | "email" | "phone" | "form", string>>
type PasswordErrors = Partial<Record<"current" | "next" | "confirm" | "form", string>>

export default function ProfileForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useUser()

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [marketing, setMarketing] = useState(user?.marketingConsent ?? false)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const [currentPw, setCurrentPw] = useState("")
  const [nextPw, setNextPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({})
  const [pwSaving, setPwSaving] = useState(false)
  const [pwDone, setPwDone] = useState(false)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (!user) return null
  const current = user

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNotice(null)

    const found: ProfileErrors = {}
    if (name.trim().length < 2) found.name = "이름을 2자 이상 입력해 주세요."
    if (!isEmail(email)) found.email = "이메일 형식을 확인해 주세요."
    if (phone && !isPhone(phone)) found.phone = "휴대폰 번호 형식을 확인해 주세요. (예: 010-1234-5678)"
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      await updateProfile(current.id, { name: name.trim(), phone: phone.trim(), marketingConsent: marketing })
      const emailChanged = email.trim().toLowerCase() !== current.email.toLowerCase()
      if (emailChanged) await changeEmail(email)
      await queryClient.invalidateQueries({ queryKey: ["profile"] })
      setNotice(
        emailChanged
          ? "저장했어요. 이메일은 새 주소로 보낸 확인 메일의 링크를 눌러야 바뀌어요."
          : "저장했어요."
      )
    } catch (err) {
      setErrors({ form: toKoreanError(err, "저장하지 못했어요. 잠시 후 다시 시도해 주세요.") })
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPwDone(false)

    const found: PasswordErrors = {}
    if (!currentPw) found.current = "현재 비밀번호를 입력해 주세요."
    if (!isStrongPassword(nextPw)) found.next = "영문과 숫자를 포함해 8자 이상 입력해 주세요."
    else if (nextPw === currentPw) found.next = "현재 비밀번호와 다른 비밀번호를 입력해 주세요."
    if (confirmPw !== nextPw) found.confirm = "새 비밀번호가 일치하지 않아요."
    setPwErrors(found)
    if (Object.keys(found).length > 0) return

    setPwSaving(true)
    try {
      await changePassword(current.email, currentPw, nextPw)
      setCurrentPw("")
      setNextPw("")
      setConfirmPw("")
      setPwDone(true)
    } catch (err) {
      const message = toKoreanError(err, "비밀번호를 바꾸지 못했어요.")
      if (message.includes("이메일 또는 비밀번호")) setPwErrors({ current: "현재 비밀번호가 맞지 않아요." })
      else setPwErrors({ form: message })
    } finally {
      setPwSaving(false)
    }
  }

  async function handleLogout() {
    await signOut()
    router.push("/")
  }

  async function handleDelete() {
    setDeleteError(null)
    try {
      await deleteMyAccount()
      router.push("/")
    } catch (err) {
      setDeleteError(toKoreanError(err, "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  const err = (key: keyof ProfileErrors) =>
    errors[key] ? (
      <p role="alert" className="field-error">
        {errors[key]}
      </p>
    ) : null

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <h2 className="text-sm font-semibold">기본 정보</h2>

        <div>
          <label htmlFor="profile-name" className="field-label">
            이름
          </label>
          <input id="profile-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
          {err("name")}
        </div>

        <div>
          <label htmlFor="profile-email" className="field-label">
            이메일 <span className="font-normal">(로그인 아이디)</span>
          </label>
          <input id="profile-email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          {err("email")}
          <p className="mt-2 text-xs">이메일을 바꾸면 새 주소로 확인 메일이 가요. 링크를 눌러야 변경이 끝나요.</p>
        </div>

        <div>
          <label htmlFor="profile-phone" className="field-label">
            휴대폰 번호
          </label>
          <input id="profile-phone" type="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
          {err("phone")}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-brown" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          이벤트·혜택 소식 수신 동의
        </label>

        {current.createdAt && <p className="text-xs">가입일 {current.createdAt}</p>}

        {err("form")}
        {notice && (
          <p role="status" className="text-sm font-medium">
            {notice}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "저장 중…" : "정보 저장"}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-5 border-t border-brown/25 pt-8" noValidate>
        <h2 className="text-sm font-semibold">비밀번호 변경</h2>

        <div>
          <label htmlFor="pw-current" className="field-label">
            현재 비밀번호
          </label>
          <input id="pw-current" type="password" autoComplete="current-password" className="field" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          {pwErrors.current && (
            <p role="alert" className="field-error">
              {pwErrors.current}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pw-next" className="field-label">
            새 비밀번호
          </label>
          <input id="pw-next" type="password" autoComplete="new-password" className="field" value={nextPw} onChange={(e) => setNextPw(e.target.value)} placeholder="영문+숫자 8자 이상" />
          {pwErrors.next && (
            <p role="alert" className="field-error">
              {pwErrors.next}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pw-confirm" className="field-label">
            새 비밀번호 확인
          </label>
          <input id="pw-confirm" type="password" autoComplete="new-password" className="field" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          {pwErrors.confirm && (
            <p role="alert" className="field-error">
              {pwErrors.confirm}
            </p>
          )}
        </div>

        {pwErrors.form && (
          <p role="alert" className="field-error">
            {pwErrors.form}
          </p>
        )}
        {pwDone && (
          <p role="status" className="text-sm font-medium">
            비밀번호를 바꿨어요.
          </p>
        )}

        <button type="submit" className="btn-outline" disabled={pwSaving}>
          {pwSaving ? "변경 중…" : "비밀번호 변경"}
        </button>
      </form>

      <div className="space-y-4 border-t border-brown/25 pt-8 text-sm">
        <button type="button" className="btn-outline" onClick={handleLogout}>
          로그아웃
        </button>

        <div>
          {confirmingDelete ? (
            <div className="space-y-3 rounded-2xl bg-paper p-5">
              <p className="font-medium">정말 탈퇴할까요?</p>
              <p className="text-xs">
                로그인 정보, 배송지, 찜 목록이 삭제되고 되돌릴 수 없어요. 주문 기록은 관련 법령에 따라 일정 기간 보관돼요.
              </p>
              {deleteError && (
                <p role="alert" className="field-error">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3">
                <button type="button" className="btn-primary" onClick={handleDelete}>
                  탈퇴하기
                </button>
                <button type="button" className="btn-outline" onClick={() => setConfirmingDelete(false)}>
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="text-xs underline underline-offset-4" onClick={() => setConfirmingDelete(true)}>
              회원 탈퇴
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
