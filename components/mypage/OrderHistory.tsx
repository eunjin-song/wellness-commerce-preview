"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Order } from "@/lib/types"
import { useApp } from "@/lib/store/app"
import { useUser } from "@/lib/hooks"
import { optionLabel } from "@/lib/store/cart"
import { won } from "@/lib/format"

export default function OrderHistory() {
  const { user } = useUser()
  const allOrders = useApp((s) => s.orders)
  // 선택자 안에서 filter를 쓰면 매번 새 배열이 만들어져 무한 렌더링이 되므로, 밖에서 거릅니다.
  const orders = useMemo<Order[]>(
    () => (user ? allOrders.filter((o) => o.userId === user.id) : []),
    [allOrders, user]
  )

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm">아직 주문 내역이 없어요.</p>
        <Link href="/products" className="btn-outline mt-6">
          상품 둘러보기
        </Link>
      </div>
    )
  }

  return (
    <ul className="space-y-6">
      {orders.map((order) => (
        <li key={order.id} className="rounded-2xl border border-brown/25 p-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs">
              {order.createdAt} · 주문번호 {order.id}
            </p>
            <span className="status-pill" data-tone={order.status === "취소" ? undefined : "solid"}>
              {order.status}
            </span>
          </div>

          <ul className="mt-4 divide-y divide-brown/15">
            {order.items.map((item, idx) => (
              <li key={`${item.productId}-${idx}`} className="flex items-center gap-4 py-3">
                <Link href={`/products/${item.productId}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brown/10">
                  {item.thumbnailUrl && <Image src={item.thumbnailUrl} alt={item.name} fill className="object-cover" sizes="64px" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  {optionLabel(item) && <p className="mt-0.5 text-xs">옵션: {optionLabel(item)}</p>}
                  <p className="mt-0.5 text-xs">수량 {item.quantity}개</p>
                </div>
                <p className="tabular-nums">{won(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-3 space-y-1 border-t border-brown/15 pt-4 text-xs">
            <p>
              받는 분 {order.recipient} · {order.phone}
            </p>
            <p>
              ({order.zip}) {order.address1} {order.address2}
            </p>
            {order.memo && <p>배송 메모: {order.memo}</p>}
          </div>

          <p className="mt-4 flex items-baseline justify-between">
            <span>
              총 결제 금액
              {order.shippingFee > 0 && <span className="ml-2 text-xs">(배송비 {won(order.shippingFee)} 포함)</span>}
            </span>
            <span className="font-display text-xl tabular-nums">{won(order.amount)}</span>
          </p>
        </li>
      ))}
    </ul>
  )
}
