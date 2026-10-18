"use client"

import Image from "next/image"
import Link from "next/link"
import { useMyOrders } from "@/lib/queries/account"
import { optionLabel } from "@/lib/store/cart"
import { won } from "@/lib/format"

export default function OrderHistory() {
  const query = useMyOrders()
  const orders = query.data ?? []

  if (query.isPending) return <p className="py-16 text-center text-sm">불러오는 중이에요…</p>
  if (query.isError) return <p className="py-16 text-center text-sm">주문 내역을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>

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
                {/* 판매가 끝나 삭제된 상품은 링크 없이 보여줍니다 */}
                {item.productId ? (
                  <Link href={`/products/${item.productId}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brown/10">
                    {item.thumbnailUrl && <Image src={item.thumbnailUrl} alt={item.name} fill className="object-cover" sizes="64px" />}
                  </Link>
                ) : (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brown/10">
                    {item.thumbnailUrl && <Image src={item.thumbnailUrl} alt={item.name} fill className="object-cover" sizes="64px" />}
                  </div>
                )}
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
