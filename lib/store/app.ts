import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Account, Address, AddressInput, Order, OrderItem, Question, Review } from "@/lib/types"
import { orderNumber, today, uid } from "@/lib/format"

type Result = { ok: true } | { ok: false; error: string }

const omitKey = <T>(obj: Record<string, T>, key: string): Record<string, T> =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key))

export interface PlaceOrderInput {
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  amount: number
  recipient: string
  phone: string
  zip: string
  address1: string
  address2: string
  memo: string
}

interface AppState {
  accounts: Account[]
  sessionUserId: string | null
  wishlist: Record<string, string[]>
  addresses: Record<string, Address[]>
  orders: Order[]
  reviews: Review[]
  questions: Question[]

  signup: (input: { name: string; email: string; phone: string; marketingConsent: boolean }) => Result
  login: (email: string) => Result
  logout: () => void
  updateProfile: (patch: Partial<Pick<Account, "name" | "phone" | "marketingConsent">>) => void
  deleteAccount: () => void

  toggleWish: (userId: string, productId: string) => void

  addAddress: (userId: string, input: AddressInput, makeDefault?: boolean) => Address
  updateAddress: (userId: string, id: string, input: AddressInput) => void
  removeAddress: (userId: string, id: string) => void
  setDefaultAddress: (userId: string, id: string) => void

  placeOrder: (userId: string, input: PlaceOrderInput) => Order
  addReview: (review: Omit<Review, "id" | "createdAt">) => void
  addQuestion: (question: Omit<Question, "id" | "createdAt" | "answer">) => void
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      sessionUserId: null,
      wishlist: {},
      addresses: {},
      orders: [],
      reviews: [],
      questions: [],

      // 미리보기 단계라 비밀번호는 저장·검증하지 않습니다. 실제 서비스에서는 Supabase Auth로 대체됩니다.
      signup: ({ name, email, phone, marketingConsent }) => {
        const normalized = email.trim().toLowerCase()
        if (get().accounts.some((a) => a.email === normalized)) {
          return { ok: false, error: "이미 가입된 이메일이에요." }
        }
        const account: Account = {
          id: uid(),
          name: name.trim(),
          email: normalized,
          phone: phone.trim(),
          marketingConsent,
          createdAt: today(),
        }
        set((s) => ({ accounts: [...s.accounts, account], sessionUserId: account.id }))
        return { ok: true }
      },

      login: (email) => {
        const account = get().accounts.find((a) => a.email === email.trim().toLowerCase())
        if (!account) return { ok: false, error: "가입되지 않은 이메일이에요. 회원가입을 먼저 해주세요." }
        set({ sessionUserId: account.id })
        return { ok: true }
      },

      logout: () => set({ sessionUserId: null }),

      updateProfile: (patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === s.sessionUserId ? { ...a, ...patch } : a)),
        })),

      deleteAccount: () =>
        set((s) => {
          const id = s.sessionUserId
          if (!id) return s
          return {
            accounts: s.accounts.filter((a) => a.id !== id),
            sessionUserId: null,
            wishlist: omitKey(s.wishlist, id),
            addresses: omitKey(s.addresses, id),
            orders: s.orders.filter((o) => o.userId !== id),
            reviews: s.reviews.filter((r) => r.userId !== id),
            questions: s.questions.filter((q) => q.userId !== id),
          }
        }),

      toggleWish: (userId, productId) =>
        set((s) => {
          const current = s.wishlist[userId] ?? []
          const next = current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [productId, ...current]
          return { wishlist: { ...s.wishlist, [userId]: next } }
        }),

      addAddress: (userId, input, makeDefault) => {
        const current = get().addresses[userId] ?? []
        const isDefault = makeDefault || current.length === 0
        const address: Address = { ...input, id: uid(), isDefault }
        set((s) => ({
          addresses: {
            ...s.addresses,
            [userId]: [...(isDefault ? current.map((a) => ({ ...a, isDefault: false })) : current), address],
          },
        }))
        return address
      },

      updateAddress: (userId, id, input) =>
        set((s) => ({
          addresses: {
            ...s.addresses,
            [userId]: (s.addresses[userId] ?? []).map((a) => (a.id === id ? { ...a, ...input } : a)),
          },
        })),

      removeAddress: (userId, id) =>
        set((s) => {
          const remaining = (s.addresses[userId] ?? []).filter((a) => a.id !== id)
          if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
            remaining[0] = { ...remaining[0], isDefault: true }
          }
          return { addresses: { ...s.addresses, [userId]: remaining } }
        }),

      setDefaultAddress: (userId, id) =>
        set((s) => ({
          addresses: {
            ...s.addresses,
            [userId]: (s.addresses[userId] ?? []).map((a) => ({ ...a, isDefault: a.id === id })),
          },
        })),

      placeOrder: (userId, input) => {
        const order: Order = {
          ...input,
          id: orderNumber(),
          userId,
          status: "주문 접수",
          createdAt: today(),
        }
        set((s) => ({ orders: [order, ...s.orders] }))
        return order
      },

      addReview: (review) =>
        set((s) => ({ reviews: [{ ...review, id: uid(), createdAt: today() }, ...s.reviews] })),

      addQuestion: (question) =>
        set((s) => ({ questions: [{ ...question, id: uid(), createdAt: today() }, ...s.questions] })),
    }),
    {
      name: "ooro-app",
      version: 1,
    }
  )
)
