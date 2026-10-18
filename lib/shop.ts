import type { OrderStatus } from "@/lib/types"

/** 배송비 정책 (임시값 — 확정되면 여기만 고치면 됩니다) */
export const SHIPPING_FEE = 3000
export const FREE_SHIPPING_THRESHOLD = 50000

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

/** 후기를 쓸 수 있는 주문 상태 (확정: 구매자만, 배송 완료 후) */
export const REVIEWABLE_STATUSES: OrderStatus[] = ["배송 완료"]

export const ORDER_STATUSES: OrderStatus[] = ["주문 접수", "결제 완료", "배송 준비중", "배송중", "배송 완료", "취소"]

/**
 * 임시 관리자 계정 (미리보기 전용).
 * 서버(Supabase)를 연결하면 이메일 목록이 아니라 계정별 권한(role)으로 바꿔야 합니다.
 */
export const ADMIN_EMAILS = ["admin@ooro.store"]
export const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email.trim().toLowerCase())
