"use client"

import Link from "next/link"
import { useWishlistIds } from "@/lib/queries/account"
import { usePublicProducts } from "@/lib/queries/shop"
import ProductCard from "@/components/products/ProductCard"

export default function Wishlist() {
  const wishlist = useWishlistIds()
  const products = usePublicProducts()

  if (wishlist.isPending || products.isPending) return <p className="py-16 text-center text-sm">불러오는 중이에요…</p>

  const ids = wishlist.data ?? []
  const wished = ids.map((id) => products.data?.find((p) => p.id === id)).filter((p) => p !== undefined)

  if (wished.length === 0) {
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
      {wished.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
