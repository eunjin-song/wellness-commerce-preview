"use client"

import Link from "next/link"
import { useCatalog, useHydrated } from "@/lib/hooks"
import { hasPriceVariation } from "@/lib/pricing"
import { won } from "@/lib/format"
import ProductGallery from "@/components/products/ProductGallery"
import ProductPurchasePanel from "@/components/products/ProductPurchasePanel"
import ProductTabs from "@/components/products/ProductTabs"

export default function ProductDetailView({ id }: { id: string }) {
  const hydrated = useHydrated()
  const catalog = useCatalog()
  const product = catalog.find((p) => p.id === id && p.isActive !== false)

  if (!product) {
    // 관리자가 만든 상품은 브라우저에 저장돼 있어서, 불러오기 전에는 "없음"으로 판단하지 않습니다.
    if (!hydrated) return <main className="mx-auto max-w-6xl px-6 py-20" aria-busy="true" />
    return (
      <main className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="font-display text-3xl">상품을 찾을 수 없어요</h1>
        <p className="mt-3 text-sm">판매가 종료되었거나 주소가 바뀌었을 수 있어요.</p>
        <Link href="/products" className="btn-primary mt-10">
          전체 상품 보기
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <ProductGallery key={product.id} images={product.images} alt={product.name} />

        <div className="flex flex-col">
          <p className="text-sm tracking-wide">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight">{product.name}</h1>
          <p className="mt-3 text-base">{product.subtitle}</p>

          <p className="mt-6 text-2xl font-medium">
            {won(product.price)}
            {hasPriceVariation(product) && <span className="ml-1 text-base font-normal">부터</span>}
          </p>

          <div className="mt-6 rounded-2xl bg-paper px-5 py-4">
            <p className="text-sm font-medium">핵심 성분 &amp; 효능</p>
            <p className="mt-1 text-sm leading-relaxed">{product.ingredients}</p>
          </div>

          <div className="mt-8">
            <ProductPurchasePanel key={product.id} product={product} />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ProductTabs product={product} />
      </div>
    </main>
  )
}
