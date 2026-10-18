import type { Metadata } from "next"
import ProductGrid from "@/components/products/ProductGrid"

export const metadata: Metadata = { title: "전체 상품 — ooro." }

export default function ProductListPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl">전체 컬렉션</h1>
      <p className="mt-3">몸과 마음의 리듬을 위한 웰니스 제품들을 만나보세요.</p>

      <div className="mt-10">
        <ProductGrid />
      </div>
    </main>
  )
}
