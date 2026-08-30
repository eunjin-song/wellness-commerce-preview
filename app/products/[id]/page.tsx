import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById, PRODUCTS } from "@/lib/mock/products"
import ProductGallery from "@/components/products/ProductGallery"
import ProductPurchasePanel from "@/components/products/ProductPurchasePanel"
import ProductTabs from "@/components/products/ProductTabs"

interface Props {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = getProductById(id)
  if (!product) return {}

  return {
    title: `${product.name} — Still & Sage`,
    description: product.subtitle,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) notFound()

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col">
          <p className="font-sans text-sm tracking-wide text-sage-600">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink">{product.name}</h1>
          <p className="mt-3 font-sans text-base text-ink/60">{product.subtitle}</p>

          <p className="mt-6 font-sans text-2xl font-medium text-ink">
            {product.price.toLocaleString("ko-KR")}원
          </p>

          <div className="mt-6 rounded-2xl bg-sage-50 px-5 py-4">
            <p className="text-sm font-medium text-sage-900">핵심 성분 &amp; 효능</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/70">{product.ingredients}</p>
          </div>

          <div className="mt-8">
            <ProductPurchasePanel
              productId={product.id}
              name={product.name}
              price={product.price}
              stock={product.stock}
              thumbnailUrl={product.images[0]}
            />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ProductTabs
          description={product.description}
          usageGuide={product.usageGuide}
          reviews={product.reviews}
        />
      </div>
    </main>
  )
}
