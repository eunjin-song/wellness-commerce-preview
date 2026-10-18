"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/lib/store/app"
import { useUser } from "@/lib/hooks"
import { isPhone } from "@/lib/format"

export default function ProfileForm() {
  const router = useRouter()
  const { user } = useUser()
  const updateProfile = useApp((s) => s.updateProfile)
  const logout = useApp((s) => s.logout)
  const deleteAccount = useApp((s) => s.deleteAccount)

  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [marketing, setMarketing] = useState(user?.marketingConsent ?? false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!user) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)
    if (name.trim().length < 2) return setError("이름을 2자 이상 입력해 주세요.")
    if (phone && !isPhone(phone)) return setError("휴대폰 번호 형식을 확인해 주세요. (예: 010-1234-5678)")
    setError(null)
    updateProfile({ name: name.trim(), phone: phone.trim(), marketingConsent: marketing })
    setSaved(true)
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  function handleDelete() {
    deleteAccount()
    router.push("/")
  }

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="profile-email" className="field-label">
            이메일
          </label>
          <input id="profile-email" className="field" value={user.email} readOnly disabled />
        </div>

        <div>
          <label htmlFor="profile-name" className="field-label">
            이름
          </label>
          <input id="profile-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label htmlFor="profile-phone" className="field-label">
            휴대폰 번호
          </label>
          <input id="profile-phone" type="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-brown" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          이벤트·혜택 소식 수신 동의
        </label>

        <p className="text-xs">가입일 {user.createdAt}</p>

        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm font-medium">
            저장했어요.
          </p>
        )}

        <button type="submit" className="btn-primary">
          정보 저장
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
