"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/lib/store/app"
import { useUser } from "@/lib/hooks"
import { isEmail, isPhone } from "@/lib/format"

type ProfileErrors = Partial<Record<"name" | "email" | "phone", string>>
type PasswordErrors = Partial<Record<"current" | "next" | "confirm", string>>

export default function ProfileForm() {
  const router = useRouter()
  const { user } = useUser()
  const updateProfile = useApp((s) => s.updateProfile)
  const changeEmail = useApp((s) => s.changeEmail)
  const logout = useApp((s) => s.logout)
  const deleteAccount = useApp((s) => s.deleteAccount)

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [marketing, setMarketing] = useState(user?.marketingConsent ?? false)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [saved, setSaved] = useState(false)

  const [currentPw, setCurrentPw] = useState("")
  const [nextPw, setNextPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({})
  const [pwDone, setPwDone] = useState(false)

  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!user) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)

    const found: ProfileErrors = {}
    if (name.trim().length < 2) found.name = "이름을 2자 이상 입력해 주세요."
    if (!isEmail(email)) found.email = "이메일 형식을 확인해 주세요."
    if (phone && !isPhone(phone)) found.phone = "휴대폰 번호 형식을 확인해 주세요. (예: 010-1234-5678)"
    if (Object.keys(found).length > 0) return setErrors(found)

    const emailResult = changeEmail(email)
    if (!emailResult.ok) return setErrors({ email: emailResult.error })

    updateProfile({ name: name.trim(), phone: phone.trim(), marketingConsent: marketing })
    setErrors({})
    setSaved(true)
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPwDone(false)

    const found: PasswordErrors = {}
    if (!currentPw) found.current = "현재 비밀번호를 입력해 주세요."
    if (nextPw.length < 8 || !/[A-Za-z]/.test(nextPw) || !/\d/.test(nextPw)) found.next = "영문과 숫자를 포함해 8자 이상 입력해 주세요."
    else if (nextPw === currentPw) found.next = "현재 비밀번호와 다른 비밀번호를 입력해 주세요."
    if (confirmPw !== nextPw) found.confirm = "새 비밀번호가 일치하지 않아요."
    setPwErrors(found)
    if (Object.keys(found).length > 0) return

    // 미리보기 단계: 비밀번호를 저장하지 않으므로 화면 흐름만 확인합니다.
    setCurrentPw("")
    setNextPw("")
    setConfirmPw("")
    setPwDone(true)
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  function handleDelete() {
    deleteAccount()
    router.push("/")
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
            이메일
          </label>
          <input id="profile-email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          {err("email")}
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

        <p className="text-xs">가입일 {user.createdAt}</p>

        {saved && (
          <p role="status" className="text-sm font-medium">
            저장했어요.
          </p>
        )}

        <button type="submit" className="btn-primary">
          정보 저장
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

        {pwDone && (
          <p role="status" className="text-sm font-medium">
            비밀번호 변경 화면 확인을 마쳤어요. (미리보기에서는 실제로 저장되지 않아요)
          </p>
        )}

        <button type="submit" className="btn-outline">
          비밀번호 변경
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
              <p className="text-xs">주문 내역, 배송지, 찜 목록이 모두 삭제되고 되돌릴 수 없어요.</p>
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
