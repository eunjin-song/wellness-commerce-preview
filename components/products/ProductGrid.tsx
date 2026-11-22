"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import ProductCard from "@/components/products/ProductCard"

export default function ProductGrid({ products }: { products: Product[] }) {
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean)
  const [category, setCategory] = useState<string | null>(null)
  const visible = category ? products.filter((p) => p.category === category) : products

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 border-b border-brown/15 pb-5" role="group" aria-label="카테고리">
        <button type="button" className="cat-tab" aria-pressed={category === null} onClick={() => setCategory(null)}>
          전체
        </button>
        {categories.map((c) => (
          <button key={c} type="button" className="cat-tab" aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-sm">등록된 상품이 없어요.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
