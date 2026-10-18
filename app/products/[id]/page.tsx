import type { Metadata } from "next"
import { getProductById } from "@/lib/mock/products"
import ProductDetailView from "@/components/products/ProductDetailView"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = getProductById(id)
  if (!product) return {}

  return {
    title: `${product.name} — ooro.`,
    description: product.subtitle,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  return <ProductDetailView id={id} />
}
