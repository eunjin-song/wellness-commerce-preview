"use client"

import { useState } from "react"
import type { Address, AddressInput } from "@/lib/types"
import { isPhone } from "@/lib/format"

interface Props {
  initial?: Address
  defaultRecipient?: string
  defaultPhone?: string
  submitLabel?: string
  onSubmit: (values: AddressInput) => void
  onCancel?: () => void
}

type Errors = Partial<Record<"recipient" | "phone" | "zip" | "address1", string>>

export default function AddressForm({
  initial,
  defaultRecipient = "",
  defaultPhone = "",
  submitLabel = "저장",
  onSubmit,
  onCancel,
}: Props) {
  const [label, setLabel] = useState(initial?.label ?? "")
  const [recipient, setRecipient] = useState(initial?.recipient ?? defaultRecipient)
  const [phone, setPhone] = useState(initial?.phone ?? defaultPhone)
  const [zip, setZip] = useState(initial?.zip ?? "")
  const [address1, setAddress1] = useState(initial?.address1 ?? "")
  const [address2, setAddress2] = useState(initial?.address2 ?? "")
  const [errors, setErrors] = useState<Errors>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    const found: Errors = {}
    if (!recipient.trim()) found.recipient = "받는 분 이름을 입력해 주세요."
    if (!isPhone(phone)) found.phone = "휴대폰 번호 형식을 확인해 주세요. (예: 010-1234-5678)"
    if (!/^\d{5}$/.test(zip.trim())) found.zip = "우편번호 5자리를 입력해 주세요."
    if (!address1.trim()) found.address1 = "주소를 입력해 주세요."
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSubmit({
      label: label.trim() || "배송지",
      recipient: recipient.trim(),
      phone: phone.trim(),
      zip: zip.trim(),
      address1: address1.trim(),
      address2: address2.trim(),
    })
  }

  const err = (key: keyof Errors) =>
    errors[key] ? (
      <p role="alert" className="field-error">
        {errors[key]}
      </p>
    ) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-paper p-6" noValidate>
      <div>
        <label htmlFor="addr-label" className="field-label">
          배송지 이름 <span className="font-normal">(선택)</span>
        </label>
        <input id="addr-label" className="field" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="집, 회사 등" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="addr-recipient" className="field-label">
            받는 분
          </label>
          <input id="addr-recipient" className="field" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          {err("recipient")}
        </div>
        <div>
          <label htmlFor="addr-phone" className="field-label">
            연락처
          </label>
          <input id="addr-phone" type="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
          {err("phone")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <div>
          <label htmlFor="addr-zip" className="field-label">
            우편번호
          </label>
          <input id="addr-zip" inputMode="numeric" maxLength={5} className="field" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} />
          {err("zip")}
        </div>
        <div>
          <label htmlFor="addr-1" className="field-label">
            주소
          </label>
          <input id="addr-1" className="field" value={address1} onChange={(e) => setAddress1(e.target.value)} />
          {err("address1")}
        </div>
      </div>

      <div>
        <label htmlFor="addr-2" className="field-label">
          상세 주소 <span className="font-normal">(선택)</span>
        </label>
        <input id="addr-2" className="field" value={address2} onChange={(e) => setAddress2(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline">
            취소
          </button>
        )}
      </div>
    </form>
  )
}
