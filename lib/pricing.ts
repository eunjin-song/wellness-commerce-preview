import type { Product } from "@/lib/types"

/** 선택한 옵션까지 더한 1개당 가격 */
export function unitPrice(product: Pick<Product, "price" | "colors" | "sizes">, color?: string | null, size?: string | null) {
  const colorExtra = product.colors.find((c) => c.name === color)?.extra ?? 0
  const sizeExtra = product.sizes.find((s) => s.name === size)?.extra ?? 0
  return product.price + colorExtra + sizeExtra
}

/**
 * 판매가 계산: 정가 × (100 − 할인율) ÷ 100 을 10원 단위로 내림. (예: 58,000원 · 15% → 49,300원)
 * 서버(DB)도 똑같은 규칙으로 계산해서, 화면에서 미리 보여주는 값과 실제 저장되는 값이 항상 같아요.
 */
export function salePrice(listPrice: number, percent: number): number {
  if (percent <= 0) return listPrice
  return Math.floor((listPrice * (100 - percent)) / 1000) * 10
}

/** 보여줄 할인율(%). 할인이 없으면 null (할인 표시를 하지 않아요) */
export function discountPercent(product: Pick<Product, "originalPrice" | "discountPercent">): number | null {
  return product.originalPrice && product.discountPercent > 0 ? product.discountPercent : null
}

/** 옵션에 따라 가격이 달라지는 상품인지 (목록에서 "~"를 붙이는 기준) */
export function hasPriceVariation(product: Pick<Product, "colors" | "sizes">) {
  return [...product.colors, ...product.sizes].some((o) => (o.extra ?? 0) > 0)
}
