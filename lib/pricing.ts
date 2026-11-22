import type { Product } from "@/lib/types"

/** 선택한 옵션까지 더한 1개당 가격 */
export function unitPrice(product: Pick<Product, "price" | "colors" | "sizes">, color?: string | null, size?: string | null) {
  const colorExtra = product.colors.find((c) => c.name === color)?.extra ?? 0
  const sizeExtra = product.sizes.find((s) => s.name === size)?.extra ?? 0
  return product.price + colorExtra + sizeExtra
}

/** 할인율(%). 정가가 없거나 판매가보다 크지 않으면 null (할인 표시를 하지 않아요) */
export function discountPercent(product: Pick<Product, "price" | "originalPrice">): number | null {
  const original = product.originalPrice
  if (!original || original <= product.price) return null
  const percent = Math.round((1 - product.price / original) * 100)
  return percent >= 1 ? percent : null
}

/** 옵션에 따라 가격이 달라지는 상품인지 (목록에서 "~"를 붙이는 기준) */
export function hasPriceVariation(product: Pick<Product, "colors" | "sizes">) {
  return [...product.colors, ...product.sizes].some((o) => (o.extra ?? 0) > 0)
}
