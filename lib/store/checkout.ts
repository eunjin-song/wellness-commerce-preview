import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { CartItem } from "@/lib/store/cart"

/**
 * 지금 결제하려는 상품 목록.
 * - cart: 장바구니 전체 주문 (주문 완료 후 장바구니를 비움)
 * - direct: 상품 페이지에서 "바로 구매" (장바구니는 그대로 둠)
 * 새로고침해도 유지되도록 sessionStorage에 저장합니다.
 */
interface CheckoutState {
  items: CartItem[]
  source: "cart" | "direct"
  setItems: (items: CartItem[], source: "cart" | "direct") => void
  reset: () => void
}

export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      items: [],
      source: "cart",
      setItems: (items, source) => set({ items, source }),
      reset: () => set({ items: [], source: "cart" }),
    }),
    {
      name: "ooro-checkout",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
