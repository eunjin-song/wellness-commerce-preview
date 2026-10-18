"use client"

import Link from "next/link"
import { useCatalog } from "@/lib/hooks"
import ProductEditor from "@/components/admin/ProductEditor"

export default function ProductEditLoader({ id }: { id: string }) {
  const catalog = useCatalog()
  const product = catalog.find((p) => p.id === id)

  if (!product) {
    return (
      <p className="text-sm">
        상품을 찾을 수 없어요.{" "}
        <Link href="/admin/products" className="underline underline-offset-4">
          목록으로
        </Link>
      </p>
    )
  }

  return (
    <>
      <h2 className="mb-8 font-display text-2xl">상품 수정</h2>
      <ProductEditor key={product.id} product={product} />
    </>
  )
}
