/** 배송비 정책 (임시값 — 확정되면 여기만 고치면 됩니다) */
export const SHIPPING_FEE = 3000
export const FREE_SHIPPING_THRESHOLD = 50000

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}
