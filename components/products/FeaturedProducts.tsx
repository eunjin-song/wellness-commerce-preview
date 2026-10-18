"use client"

import { useProducts } from "@/lib/hooks"
import ProductCard from "@/components/products/ProductCard"

export default function FeaturedProducts() {
  const featured = useProducts()
    .filter((p) => p.stock > 0)
    .slice(0, 3)

  return (
    <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
      {featured.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
