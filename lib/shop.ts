import type { OrderStatus, ShopSettings } from "@/lib/types"

/** 배송비: 값은 DB(shop_settings)에 있고, 관리자 대시보드에서 바꿀 수 있어요. */
export function shippingFor(subtotal: number, settings: ShopSettings) {
  return subtotal === 0 || subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee
}

/** 후기를 쓸 수 있는 주문 상태 (확정: 구매자만, 배송 완료 후). DB 정책(reviews_insert)에도 같은 규칙이 있어요. */
export const REVIEWABLE_STATUSES: OrderStatus[] = ["배송 완료"]

export const ORDER_STATUSES: OrderStatus[] = ["주문 접수", "결제 완료", "배송 준비중", "배송중", "배송 완료", "취소"]

/** 장바구니에서 수량 상한 (실제 재고는 주문할 때 서버가 확인해요) */
export const MAX_QUANTITY = 99
