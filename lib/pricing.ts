import type { Product } from "@/lib/mock/products"

/** 선택한 옵션까지 더한 1개당 가격 */
export function unitPrice(product: Product, color?: string | null, size?: string | null) {
  const colorExtra = product.colors?.find((c) => c.name === color)?.extra ?? 0
  const sizeExtra = product.sizes?.find((s) => s.name === size)?.extra ?? 0
  return product.price + colorExtra + sizeExtra
}

/** 옵션에 따라 가격이 달라지는 상품인지 (목록에서 "~"를 붙이는 기준) */
export function hasPriceVariation(product: Product) {
  return [...(product.colors ?? []), ...(product.sizes ?? [])].some((o) => (o.extra ?? 0) > 0)
}
