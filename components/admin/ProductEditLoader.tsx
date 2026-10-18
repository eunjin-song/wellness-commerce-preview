"use client"

import Link from "next/link"
import { useAdminProducts } from "@/lib/queries/admin"
import ProductEditor from "@/components/admin/ProductEditor"

export default function ProductEditLoader({ id }: { id: string }) {
  const query = useAdminProducts()

  if (query.isPending) return <p className="text-sm">불러오는 중이에요…</p>

  const product = query.data?.find((p) => p.id === id)
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
