"use client"

import { useState } from "react"
import type { Address } from "@/lib/types"
import { useApp } from "@/lib/store/app"
import { useUser } from "@/lib/hooks"
import AddressForm from "@/components/mypage/AddressForm"

const EMPTY: Address[] = []

export default function AddressManager() {
  const { user } = useUser()
  const addresses = useApp((s) => (user ? (s.addresses[user.id] ?? EMPTY) : EMPTY))
  const { addAddress, updateAddress, removeAddress, setDefaultAddress } = useApp.getState()

  const [mode, setMode] = useState<"list" | "new" | { editId: string }>("list")
  const [removingId, setRemovingId] = useState<string | null>(null)

  if (!user) return null

  const editing = typeof mode === "object" ? addresses.find((a) => a.id === mode.editId) : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm">주문할 때 바로 선택할 수 있어요.</p>
        {mode === "list" && (
          <button type="button" className="btn-primary" onClick={() => setMode("new")}>
            배송지 추가
          </button>
        )}
      </div>

      {mode === "new" && (
        <AddressForm
          defaultRecipient={user.name}
          defaultPhone={user.phone}
          submitLabel="배송지 저장"
          onSubmit={(values) => {
            addAddress(user.id, values)
            setMode("list")
          }}
          onCancel={() => setMode("list")}
        />
      )}

      {editing && (
        <AddressForm
          initial={editing}
          submitLabel="수정 저장"
          onSubmit={(values) => {
            updateAddress(user.id, editing.id, values)
            setMode("list")
          }}
          onCancel={() => setMode("list")}
        />
      )}

      {addresses.length === 0 && mode === "list" ? (
        <p className="py-10 text-center text-sm">저장된 배송지가 없어요.</p>
      ) : (
        <ul className="space-y-4">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-2xl border border-brown/25 p-5 text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium">{a.label}</p>
                {a.isDefault && (
                  <span className="status-pill" data-tone="solid">
                    기본 배송지
                  </span>
                )}
              </div>
              <p className="mt-2">
                {a.recipient} · {a.phone}
              </p>
              <p className="mt-1">
                ({a.zip}) {a.address1} {a.address2}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <button type="button" className="underline underline-offset-4" onClick={() => setMode({ editId: a.id })}>
                  수정
                </button>
                {!a.isDefault && (
                  <button type="button" className="underline underline-offset-4" onClick={() => setDefaultAddress(user.id, a.id)}>
                    기본 배송지로 설정
                  </button>
                )}
                {removingId === a.id ? (
                  <span className="flex gap-3">
                    <span>삭제할까요?</span>
                    <button
                      type="button"
                      className="font-medium underline underline-offset-4"
                      onClick={() => {
                        removeAddress(user.id, a.id)
                        setRemovingId(null)
                      }}
                    >
                      삭제
                    </button>
                    <button type="button" className="underline underline-offset-4" onClick={() => setRemovingId(null)}>
                      취소
                    </button>
                  </span>
                ) : (
                  <button type="button" className="underline underline-offset-4" onClick={() => setRemovingId(a.id)}>
                    삭제
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
