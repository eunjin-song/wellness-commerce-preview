"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/lib/store/cart"

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  if (!mounted) return null

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-brown">장바구니가 비어 있습니다.</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-brown underline underline-offset-4">
          상품 둘러보기
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-brown">장바구니</h1>

      <ul className="mt-10 divide-y divide-brown/20">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-6">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brown/10">
              {item.thumbnailUrl && (
                <Image src={item.thumbnailUrl} alt={item.name} fill className="object-cover" sizes="80px" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-brown">{item.name}</p>
              <p className="mt-1 text-sm text-brown">{item.price.toLocaleString("ko-KR")}원</p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-brown/25 px-3 py-1.5">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label="수량 감소"
                className="h-6 w-6 text-brown disabled:opacity-30"
              >
                −
              </button>
              <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                aria-label="수량 증가"
                className="h-6 w-6 text-brown disabled:opacity-30"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right text-sm font-medium text-brown">
              {(item.price * item.quantity).toLocaleString("ko-KR")}원
            </p>

            <button
              onClick={() => removeItem(item.productId)}
              aria-label="삭제"
              className="text-xs text-brown underline underline-offset-4"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t border-brown/25 pt-6">
        <span className="text-base text-brown">총 결제 금액</span>
        <span className="font-display text-2xl text-brown">{total.toLocaleString("ko-KR")}원</span>
      </div>

      <button
        disabled
        title="결제 연동은 미리보기 범위 밖입니다"
        className="mt-6 block w-full cursor-not-allowed rounded-full bg-brown/50 py-4 text-center text-sm font-medium text-paper"
      >
        주문하기 (미리보기에서는 비활성화)
      </button>
    </main>
  )
}
