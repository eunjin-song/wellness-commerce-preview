import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  /** 상품 + 색상 + 사이즈 조합마다 하나의 줄이 됩니다 */
  key: string
  productId: string
  name: string
  price: number
  quantity: number
  thumbnailUrl: string | null
  stock: number
  color?: string
  size?: string
}

export const cartKey = (productId: string, color?: string, size?: string) =>
  [productId, color ?? "", size ?? ""].join("|")

export const optionLabel = (item: { color?: string; size?: string }) =>
  [item.color, item.size].filter(Boolean).join(" / ")

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "key" | "quantity"> & { quantity?: number }) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const key = cartKey(item.productId, item.color, item.size)
          const addQty = item.quantity ?? 1
          const existing = state.items.find((i) => i.key === key)

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: Math.min(i.quantity + addQty, i.stock) } : i
              ),
            }
          }
          return {
            items: [...state.items, { ...item, key, quantity: Math.min(addQty, item.stock) }],
          }
        }),
      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ooro-cart",
      version: 1,
    }
  )
)
