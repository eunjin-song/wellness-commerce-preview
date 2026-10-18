"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Address } from "@/lib/types"
import { optionLabel, useCartStore } from "@/lib/store/cart"
import { useCheckout } from "@/lib/store/checkout"
import { useRequireUser } from "@/lib/hooks"
import { useAddressMutations, useAddresses, usePlaceOrder } from "@/lib/queries/account"
import { useSettings } from "@/lib/queries/shop"
import { toKoreanError } from "@/lib/db/errors"
import { shippingFor } from "@/lib/shop"
import { won } from "@/lib/format"
import AddressForm from "@/components/mypage/AddressForm"

const EMPTY: Address[] = []

export default function CheckoutView() {
  const router = useRouter()
  const { hydrated, user } = useRequireUser()
  const settings = useSettings()

  const items = useCheckout((s) => s.items)
  const source = useCheckout((s) => s.source)
  const resetCheckout = useCheckout((s) => s.reset)
  const clearCart = useCartStore((s) => s.clear)

  const addressesQuery = useAddresses()
  const addresses = addressesQuery.data ?? EMPTY
  const { add: addAddress } = useAddressMutations()
  const placeOrder = usePlaceOrder()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState<{ id: string; amount: number } | null>(null)

  const ready = hydrated && user !== null

  useEffect(() => {
    if (ready && items.length === 0 && !completed) router.replace("/cart")
  }, [ready, items.length, completed, router])

  if (!ready || !user) return <main className="mx-auto max-w-3xl px-6 py-16" aria-busy="true" />

  if (completed) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-3xl">주문이 접수됐어요</h1>
        <p className="mt-4 text-sm">주문번호 {completed.id}</p>
        <p className="mt-1 text-sm">결제 금액 {won(completed.amount)}</p>
        <p className="mt-2 text-sm">결제 연동 전 단계라 실제 결제는 이뤄지지 않았어요.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/mypage" className="btn-primary">
            주문 내역 보기
          </Link>
          <Link href="/products" className="btn-outline">
            쇼핑 계속하기
          </Link>
        </div>
      </main>
    )
  }

  const selected = addresses.find((a) => a.id === selectedId) ?? addresses.find((a) => a.isDefault) ?? addresses[0]
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingFee = shippingFor(subtotal, settings)
  const total = subtotal + shippingFee
  const showForm = adding || (addresses.length === 0 && !addressesQuery.isPending)

  async function handlePlaceOrder() {
    if (!selected) {
      setError("배송지를 추가해 주세요.")
      return
    }
    setError(null)
    try {
      const order = await placeOrder.mutateAsync({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color, size: i.size })),
        address: selected,
        memo: memo.trim(),
      })
      setCompleted(order)
      if (source === "cart") clearCart()
      resetCheckout()
    } catch (err) {
      setError(toKoreanError(err, "주문하지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">주문서</h1>

      <section className="mt-10">
        <h2 className="text-sm font-semibold">주문 상품</h2>
        <ul className="mt-3 divide-y divide-brown/20 border-y border-brown/20">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-4 py-4 text-sm">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brown/10">
                {item.thumbnailUrl && <Image src={item.thumbnailUrl} alt={item.name} fill className="object-cover" sizes="64px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.name}</p>
                {optionLabel(item) && <p className="mt-0.5 text-xs">옵션: {optionLabel(item)}</p>}
                <p className="mt-0.5 text-xs">수량 {item.quantity}개</p>
              </div>
              <p className="tabular-nums">{won(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">배송지</h2>
          {!showForm && (
            <button type="button" className="text-xs underline underline-offset-4" onClick={() => setAdding(true)}>
              새 배송지 추가
            </button>
          )}
        </div>

        {showForm ? (
          <div className="mt-3">
            <AddressForm
              defaultRecipient={user.name}
              defaultPhone={user.phone}
              submitLabel="배송지 저장"
              onSubmit={async (values) => {
                try {
                  const created = await addAddress.mutateAsync({ input: values })
                  setSelectedId(created.id)
                  setAdding(false)
                  setError(null)
                } catch (err) {
                  setError(toKoreanError(err, "배송지를 저장하지 못했어요."))
                }
              }}
              onCancel={addresses.length > 0 ? () => setAdding(false) : undefined}
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {addresses.map((a) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brown/25 p-4 text-sm has-checked:border-brown has-checked:bg-paper">
                  <input
                    type="radio"
                    name="address"
                    className="mt-1 h-4 w-4 accent-brown"
                    checked={selected?.id === a.id}
                    onChange={() => setSelectedId(a.id)}
                  />
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      {a.label}
                      {a.isDefault && (
                        <span className="status-pill" data-tone="solid">
                          기본
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block">
                      {a.recipient} · {a.phone}
                    </span>
                    <span className="block">
                      ({a.zip}) {a.address1} {a.address2}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <label htmlFor="order-memo" className="field-label">
            배송 메모 <span className="font-normal">(선택)</span>
          </label>
          <input
            id="order-memo"
            className="field"
            value={memo}
            maxLength={200}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="문 앞에 놓아주세요"
          />
        </div>
      </section>

      <dl className="mt-10 space-y-3 border-t border-brown/25 pt-6 text-sm">
        <div className="flex justify-between">
          <dt>상품 금액</dt>
          <dd className="tabular-nums">{won(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>배송비</dt>
          <dd className="tabular-nums">{shippingFee === 0 ? "무료" : won(shippingFee)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-brown/25 pt-4">
          <dt className="text-base">총 결제 금액 (예상)</dt>
          <dd className="font-display text-2xl tabular-nums">{won(total)}</dd>
        </div>
      </dl>

      <p className="mt-8 rounded-xl bg-paper p-4 text-xs leading-relaxed">
        결제 연동 전 단계예요. 주문하기를 누르면 결제 없이 &apos;주문 접수&apos; 상태의 테스트 주문이 저장돼요. 최종 금액은 서버가
        가격·재고·배송비를 다시 계산해서 정해요.
      </p>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      <button type="button" onClick={handlePlaceOrder} disabled={placeOrder.isPending} className="btn-primary mt-6 w-full py-4">
        {placeOrder.isPending ? "주문하는 중…" : `${won(total)} 주문하기`}
      </button>
    </main>
  )
}
