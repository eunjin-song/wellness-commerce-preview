import type { Metadata } from "next"
import ProductGrid from "@/components/products/ProductGrid"
import ServerNotice from "@/components/layout/ServerNotice"
import { getPublicProducts } from "@/lib/db/public"

export const metadata: Metadata = { title: "전체 상품 — ooro." }
export const revalidate = 30

export default async function ProductListPage() {
  const { products, configured, failed } = await getPublicProducts()

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-14 md:pt-20">
      <header className="mb-10 text-center md:mb-14">
        <p className="eyebrow">Shop</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">전체 컬렉션</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed">몸과 마음의 리듬을 위한 웰니스 제품들을 만나보세요.</p>
      </header>

      {configured && !failed ? <ProductGrid products={products} /> : <ServerNotice configured={configured} />}
    </main>
  )
}
