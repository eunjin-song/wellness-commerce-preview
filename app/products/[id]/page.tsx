import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPublicProduct } from "@/lib/db/public"
import ProductDetailView from "@/components/products/ProductDetailView"
import ServerNotice from "@/components/layout/ServerNotice"

export const revalidate = 30

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { product } = await getPublicProduct(id)
  if (!product) return {}

  return {
    title: `${product.name} — ooro.`,
    description: product.subtitle,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const { product, configured, failed } = await getPublicProduct(id)

  if (!configured || failed) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <ServerNotice configured={configured} />
      </main>
    )
  }
  if (!product) notFound()

  return <ProductDetailView product={product} />
}
