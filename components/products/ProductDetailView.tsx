import type { Product } from "@/lib/types"
import { discountPercent, hasPriceVariation } from "@/lib/pricing"
import { won } from "@/lib/format"
import ProductGallery from "@/components/products/ProductGallery"
import ProductPurchasePanel from "@/components/products/ProductPurchasePanel"
import ProductTabs from "@/components/products/ProductTabs"

export default function ProductDetailView({ product }: { product: Product }) {
  const percent = discountPercent(product)
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col md:sticky md:top-28">
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-[2.75rem]">{product.name}</h1>
          <p className="mt-3 text-base leading-relaxed">{product.subtitle}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-brown/15 pt-6">
            {percent !== null && product.originalPrice !== null && (
              <>
                <span className="sr-only">정가</span>
                <s className="text-base opacity-60">{won(product.originalPrice)}</s>
              </>
            )}
            {percent !== null && (
              <span className="text-2xl font-semibold" aria-label={`${percent}퍼센트 할인`}>
                {percent}%
              </span>
            )}
            <p className="text-2xl font-medium">
              {won(product.price)}
              {hasPriceVariation(product) && <span className="ml-1 text-base font-normal">부터</span>}
            </p>
          </div>

          {product.ingredients && (
            <div className="mt-6 rounded-md bg-paper px-5 py-4">
              <p className="text-sm font-medium">핵심 성분 &amp; 효능</p>
              <p className="mt-1 text-sm leading-relaxed">{product.ingredients}</p>
            </div>
          )}

          <div className="mt-8">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ProductTabs product={product} />
      </div>
    </main>
  )
}
