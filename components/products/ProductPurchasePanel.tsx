"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/store/cart"

interface Props {
  productId: string
  name: string
  price: number
  stock: number
  thumbnailUrl: string | null
}

export default function ProductPurchasePanel({ productId, name, price, stock, thumbnailUrl }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const inc = () => setQuantity((q) => Math.min(q + 1, stock))
  const dec = () => setQuantity((q) => Math.max(q - 1, 1))
  const totalPrice = price * quantity

  function handleAddToCart() {
    addItem({ productId, name, price, thumbnailUrl, stock, quantity })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  function handleBuyNow() {
    addItem({ productId, name, price, thumbnailUrl, stock, quantity })
    router.push("/cart")
  }

  return (
    <div className="space-y-5">
      <div className="flex w-fit items-center justify-between rounded-full border border-sage-200 px-4 py-2">
        <button
          onClick={dec}
          disabled={quantity <= 1}
          aria-label="수량 감소"
          className="h-8 w-8 rounded-full text-lg text-ink/70 transition hover:bg-sage-50 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-10 text-center font-sans tabular-nums">{quantity}</span>
        <button
          onClick={inc}
          disabled={quantity >= stock}
          aria-label="수량 증가"
          className="h-8 w-8 rounded-full text-lg text-ink/70 transition hover:bg-sage-50 disabled:opacity-30"
        >
          +
        </button>
      </div>

      <p className="text-sm text-ink/50">{stock > 0 ? `재고 ${stock}개` : "일시 품절"}</p>

      <div className="flex items-center justify-between border-t border-sage-200 pt-4">
        <span className="text-sm text-ink/60">총 상품 금액</span>
        <span className="font-sans text-xl font-semibold text-ink">
          {totalPrice.toLocaleString("ko-KR")}원
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className="rounded-full border border-sage-400 py-3.5 text-sm font-medium text-sage-600
                     transition duration-300 ease-gentle hover:bg-sage-50 disabled:opacity-40"
        >
          {justAdded ? "담았어요" : "장바구니 담기"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={stock === 0}
          className="rounded-full bg-sage-400 py-3.5 text-sm font-medium text-white
                     transition duration-300 ease-gentle hover:bg-sage-600 disabled:opacity-40"
        >
          바로 구매하기
        </button>
      </div>
    </div>
  )
}
