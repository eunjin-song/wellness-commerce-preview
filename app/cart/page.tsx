"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { optionLabel, useCartStore } from "@/lib/store/cart"
import { useCheckout } from "@/lib/store/checkout"
import { useHydrated } from "@/lib/hooks"
import { useSettings } from "@/lib/queries/shop"
import { shippingFor } from "@/lib/shop"
import { won } from "@/lib/format"

export default function CartPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const settings = useSettings()
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const setCheckoutItems = useCheckout((s) => s.setItems)

  if (!hydrated) return <main className="mx-auto max-w-3xl px-6 py-16" aria-busy="true" />

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingFee = shippingFor(subtotal, settings)

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">장바구니</h1>
        <p className="mt-6">장바구니가 비어 있어요.</p>
        <Link href="/products" className="btn-outline mt-8">
          상품 둘러보기
        </Link>
      </main>
    )
  }

  function handleOrder() {
    setCheckoutItems(items, "cart")
    router.push("/checkout")
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">장바구니</h1>

      <ul className="mt-10 divide-y divide-brown/20">
        {items.map((item) => (
          <li key={item.key} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-6">
            <Link href={`/products/${item.productId}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brown/10">
              {item.thumbnailUrl && (
                <Image src={item.thumbnailUrl} alt={item.name} fill className="object-cover" sizes="80px" />
              )}
            </Link>

            <div className="min-w-0 flex-1 basis-40">
              <p className="text-sm font-medium">{item.name}</p>
              {optionLabel(item) && <p className="mt-1 text-xs">옵션: {optionLabel(item)}</p>}
              <p className="mt-1 text-sm">{won(item.price)}</p>
            </div>

            <div className="flex items-center rounded-full border border-brown/25 px-2 py-1">
              <button
                type="button"
                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label={`${item.name} 수량 감소`}
                className="h-7 w-7 disabled:opacity-30"
              >
                −
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                aria-label={`${item.name} 수량 증가`}
                className="h-7 w-7 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right text-sm font-medium tabular-nums">{won(item.price * item.quantity)}</p>

            <button
              type="button"
              onClick={() => removeItem(item.key)}
              aria-label={`${item.name} 삭제`}
              className="text-xs underline underline-offset-4"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      <dl className="mt-8 space-y-3 border-t border-brown/25 pt-6 text-sm">
        <div className="flex justify-between">
          <dt>상품 금액</dt>
          <dd className="tabular-nums">{won(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>배송비</dt>
          <dd className="tabular-nums">{shippingFee === 0 ? "무료" : won(shippingFee)}</dd>
        </div>
        {shippingFee > 0 && (
          <p className="text-xs">{won(settings.freeShippingThreshold - subtotal)} 더 담으면 배송비가 무료예요.</p>
        )}
        <div className="flex items-baseline justify-between border-t border-brown/25 pt-4">
          <dt className="text-base">총 결제 금액</dt>
          <dd className="font-display text-2xl tabular-nums">{won(subtotal + shippingFee)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs">장바구니의 가격은 예상 금액이에요. 주문할 때 서버가 가격·재고를 다시 확인해요.</p>

      <button type="button" onClick={handleOrder} className="btn-primary mt-8 w-full py-4">
        주문하기
      </button>
    </main>
  )
}
