import type { Product } from "@/lib/types"
import { hasPriceVariation } from "@/lib/pricing"
import { won } from "@/lib/format"
import ProductGallery from "@/components/products/ProductGallery"
import ProductPurchasePanel from "@/components/products/ProductPurchasePanel"
import ProductTabs from "@/components/products/ProductTabs"

export default function ProductDetailView({ product }: { product: Product }) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col">
          <p className="text-sm tracking-wide">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight">{product.name}</h1>
          <p className="mt-3 text-base">{product.subtitle}</p>

          <p className="mt-6 text-2xl font-medium">
            {won(product.price)}
            {hasPriceVariation(product) && <span className="ml-1 text-base font-normal">부터</span>}
          </p>

          {product.ingredients && (
            <div className="mt-6 rounded-2xl bg-paper px-5 py-4">
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
