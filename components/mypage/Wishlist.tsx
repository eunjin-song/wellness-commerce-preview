"use client"

import Link from "next/link"
import { useApp } from "@/lib/store/app"
import { useProducts, useUser } from "@/lib/hooks"
import ProductCard from "@/components/products/ProductCard"

const EMPTY: string[] = []

export default function Wishlist() {
  const { user } = useUser()
  const ids = useApp((s) => (user ? (s.wishlist[user.id] ?? EMPTY) : EMPTY))
  const catalog = useProducts()
  const products = ids.map((id) => catalog.find((p) => p.id === id)).filter((p) => p !== undefined)

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm">찜한 상품이 없어요. 마음에 드는 상품의 하트를 눌러보세요.</p>
        <Link href="/products" className="btn-outline mt-6">
          상품 둘러보기
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
