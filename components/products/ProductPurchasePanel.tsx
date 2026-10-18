"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types"
import { cartKey, useCartStore } from "@/lib/store/cart"
import { useCheckout } from "@/lib/store/checkout"
import { unitPrice } from "@/lib/pricing"
import { MAX_QUANTITY } from "@/lib/shop"
import { won } from "@/lib/format"
import HeartButton from "@/components/products/HeartButton"

type Message = { type: "error" | "added"; text: string }

const extraText = (extra?: number) => (extra && extra > 0 ? ` (+${won(extra)})` : "")

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const { id, name, inStock, colors, sizes, images } = product
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const setCheckoutItems = useCheckout((s) => s.setItems)

  const [color, setColor] = useState<string | null>(null)
  const [size, setSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState<Message | null>(null)

  const soldOut = !inStock
  const price = unitPrice(product, color, size)
  const totalPrice = price * quantity

  function validate() {
    if (colors.length > 0 && !color) {
      setMessage({ type: "error", text: "색상을 선택해 주세요." })
      return false
    }
    if (sizes.length > 0 && !size) {
      setMessage({ type: "error", text: "사이즈를 선택해 주세요." })
      return false
    }
    return true
  }

  function buildItem() {
    return {
      productId: id,
      name,
      price,
      thumbnailUrl: images[0] ?? null,
      stock: MAX_QUANTITY,
      quantity,
      color: color ?? undefined,
      size: size ?? undefined,
    }
  }

  function handleAddToCart() {
    if (!validate()) return
    addItem(buildItem())
    setMessage({ type: "added", text: "장바구니에 담았어요." })
  }

  function handleBuyNow() {
    if (!validate()) return
    const item = buildItem()
    setCheckoutItems([{ ...item, key: cartKey(id, item.color, item.size) }], "direct")
    router.push("/checkout")
  }

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <p className="field-label">
            색상 <span className="font-normal">· {color ?? "선택해 주세요"}</span>
          </p>
          <div className="flex flex-wrap gap-3" role="group" aria-label="색상 선택">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-pressed={color === c.name}
                aria-label={`${c.name}${extraText(c.extra)}`}
                title={`${c.name}${extraText(c.extra)}`}
                onClick={() => {
                  setColor(c.name)
                  setMessage(null)
                }}
                className={`h-9 w-9 rounded-full border border-brown/30 transition ${
                  color === c.name ? "ring-2 ring-brown ring-offset-2 ring-offset-cream" : "hover:border-brown"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          {colors.some((c) => (c.extra ?? 0) > 0) && (
            <p className="mt-2 text-xs">
              {colors
                .filter((c) => (c.extra ?? 0) > 0)
                .map((c) => `${c.name}${extraText(c.extra)}`)
                .join(", ")}
            </p>
          )}
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="field-label">
            사이즈 <span className="font-normal">· {size ?? "선택해 주세요"}</span>
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="사이즈 선택">
            {sizes.map((s) => (
              <button
                key={s.name}
                type="button"
                className="chip min-w-14"
                aria-pressed={size === s.name}
                onClick={() => {
                  setSize(s.name)
                  setMessage(null)
                }}
              >
                {s.name}
                {extraText(s.extra)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="field-label">수량</p>
        <div className="flex w-fit items-center rounded-full border border-brown/25 px-2 py-1.5">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
            disabled={quantity <= 1}
            aria-label="수량 감소"
            className="h-8 w-8 rounded-full text-lg transition hover:bg-paper disabled:opacity-30"
          >
            −
          </button>
          <span className="w-10 text-center tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(q + 1, MAX_QUANTITY))}
            disabled={soldOut || quantity >= MAX_QUANTITY}
            aria-label="수량 증가"
            className="h-8 w-8 rounded-full text-lg transition hover:bg-paper disabled:opacity-30"
          >
            +
          </button>
        </div>
        {soldOut && <p className="mt-2 text-sm font-medium">일시 품절</p>}
      </div>

      <div className="flex items-center justify-between border-t border-brown/25 pt-4">
        <span className="text-sm">총 상품 금액</span>
        <span className="text-xl font-semibold tabular-nums">{won(totalPrice)}</span>
      </div>

      {message && (
        <p role={message.type === "error" ? "alert" : "status"} className="text-sm font-medium">
          {message.text}
          {message.type === "added" && (
            <>
              {" "}
              <Link href="/cart" className="underline underline-offset-4">
                장바구니 보기
              </Link>
            </>
          )}
        </p>
      )}

      <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
        <button type="button" onClick={handleAddToCart} disabled={soldOut} className="btn-outline">
          장바구니 담기
        </button>
        <button type="button" onClick={handleBuyNow} disabled={soldOut} className="btn-primary">
          바로 구매하기
        </button>
        <HeartButton productId={id} className="h-12 w-12 border border-brown/25 hover:border-brown" />
      </div>
    </div>
  )
}
