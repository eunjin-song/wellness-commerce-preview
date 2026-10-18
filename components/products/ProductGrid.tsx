"use client"

import { useState } from "react"
import type { Product } from "@/lib/mock/products"
import ProductCard from "@/components/products/ProductCard"

export default function ProductGrid({ products }: { products: Product[] }) {
  const categories = Array.from(new Set(products.map((p) => p.category)))
  const [category, setCategory] = useState<string | null>(null)
  const visible = category ? products.filter((p) => p.category === category) : products

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="카테고리">
        <button type="button" className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>
          전체
        </button>
        {categories.map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
