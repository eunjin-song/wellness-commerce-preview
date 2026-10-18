"use client"

import { useState } from "react"
import { useAdminOrders, useSetOrderStatus } from "@/lib/queries/admin"
import { toKoreanError } from "@/lib/db/errors"
import { optionLabel } from "@/lib/store/cart"
import { ORDER_STATUSES } from "@/lib/shop"
import { won } from "@/lib/format"
import type { OrderStatus } from "@/lib/types"

export default function AdminOrders() {
  const query = useAdminOrders()
  const setStatus = useSetOrderStatus()
  const orders = query.data ?? []
  const [filter, setFilter] = useState<OrderStatus | "all">("all")
  const [error, setError] = useState<string | null>(null)

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  async function handleChange(id: string, status: OrderStatus) {
    setError(null)
    try {
      await setStatus.mutateAsync({ id, status })
    } catch (err) {
      setError(toKoreanError(err, "상태를 바꾸지 못했어요."))
    }
  }

  if (query.isPending) return <p className="py-10 text-center text-sm">불러오는 중이에요…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="주문 상태 필터">
        <button type="button" className="chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
          전체 {orders.length}
        </button>
        {ORDER_STATUSES.map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s} {orders.filter((o) => o.status === s).length}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm">해당하는 주문이 없어요.</p>
      ) : (
        <ul className="space-y-5">
          {visible.map((o) => (
            <li key={o.id} className="rounded-2xl border border-brown/25 p-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p>
                  <span className="font-medium">{o.id}</span>
                  <span className="ml-2 text-xs">
                    {o.createdAt}
                    {o.userId === null && " · 탈퇴 회원"}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor={`status-${o.id}`} className="text-xs">
                    주문 상태
                  </label>
                  <select
                    id={`status-${o.id}`}
                    className="field w-auto py-2"
                    value={o.status}
                    disabled={setStatus.isPending}
                    onChange={(e) => handleChange(o.id, e.target.value as OrderStatus)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-brown/15">
                {o.items.map((item, idx) => (
                  <li key={`${item.productId}-${idx}`} className="flex justify-between gap-4 py-2">
                    <span>
                      {item.name}
                      {optionLabel(item) && <span className="ml-2 text-xs">({optionLabel(item)})</span>}
                      <span className="ml-2 text-xs">× {item.quantity}</span>
                    </span>
                    <span className="tabular-nums">{won(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 space-y-1 border-t border-brown/15 pt-3 text-xs">
                <p>
                  받는 분 {o.recipient} · {o.phone}
                </p>
                <p>
                  ({o.zip}) {o.address1} {o.address2}
                </p>
                {o.memo && <p>배송 메모: {o.memo}</p>}
              </div>

              <p className="mt-3 flex justify-between font-medium">
                <span>
                  결제 금액
                  {o.shippingFee > 0 && <span className="ml-2 text-xs font-normal">(배송비 {won(o.shippingFee)} 포함)</span>}
                </span>
                <span className="tabular-nums">{won(o.amount)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
