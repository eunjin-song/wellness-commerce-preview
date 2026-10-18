"use client"

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/lib/store/app"
import { optionLabel } from "@/lib/store/cart"
import { SEED_QUESTIONS } from "@/lib/mock/qna"
import { PRODUCTS, type Product } from "@/lib/mock/products"
import { REVIEWABLE_STATUSES, isAdminEmail } from "@/lib/shop"
import type { Order, Question, Review } from "@/lib/types"

const noopSubscribe = () => () => {}

/**
 * 브라우저에 저장된 값(localStorage)을 읽어도 되는 시점인지.
 * 서버 렌더링·첫 화면과 결과를 맞추기 위해, 서버에서는 false → 브라우저에서는 true가 됩니다.
 */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

export function useUser() {
  const hydrated = useHydrated()
  const user = useApp((s) => s.accounts.find((a) => a.id === s.sessionUserId) ?? null)
  return { hydrated, user: hydrated ? user : null }
}

export function useIsAdmin() {
  const { user } = useUser()
  return user !== null && isAdminEmail(user.email)
}

/** 로그인이 필요한 페이지에서 사용 — 로그아웃 상태면 로그인 페이지로 보냅니다. */
export function useRequireUser() {
  const { hydrated, user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const hadUser = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (user) {
      hadUser.current = true
      return
    }
    // 이 화면에서 로그아웃·탈퇴한 경우에는 그 동작이 직접 이동을 처리하므로 로그인 화면으로 보내지 않습니다.
    if (!hadUser.current) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [hydrated, user, router, pathname])

  return { hydrated, user }
}

/** 판매 중지 상품까지 포함한 전체 상품 (관리자 화면용). 샘플 위에 관리자 수정 내용을 덧씌웁니다. */
export function useCatalog(): Product[] {
  const hydrated = useHydrated()
  const overrides = useApp((s) => s.productOverrides)
  const custom = useApp((s) => s.customProducts)

  return useMemo(() => {
    if (!hydrated) return PRODUCTS
    return [...PRODUCTS.map((p) => overrides[p.id] ?? p), ...custom]
  }, [hydrated, overrides, custom])
}

/** 고객에게 보이는 상품 (판매 중지 제외) */
export function useProducts(): Product[] {
  const catalog = useCatalog()
  return useMemo(() => catalog.filter((p) => p.isActive !== false), [catalog])
}

export function useProductReviews(product: Product): Review[] {
  const hydrated = useHydrated()
  const stored = useApp((s) => s.reviews)
  const hidden = useApp((s) => s.hiddenReviewIds)

  return useMemo(() => {
    const seeded: Review[] = product.reviews.map((r) => ({ ...r, productId: product.id }))
    const mine = hydrated ? stored.filter((r) => r.productId === product.id) : []
    return [...mine, ...seeded]
      .filter((r) => !hydrated || !hidden.includes(r.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [hydrated, stored, hidden, product])
}

/** 관리자용: 숨김 여부와 관계없이 모든 후기 */
export function useAllReviews(): Review[] {
  const catalog = useCatalog()
  const stored = useApp((s) => s.reviews)

  return useMemo(() => {
    const seeded = catalog.flatMap((p) => p.reviews.map((r): Review => ({ ...r, productId: p.id })))
    return [...stored, ...seeded].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [catalog, stored])
}

export type ReviewTarget =
  | { state: "login" }
  | { state: "no-purchase" }
  | { state: "not-delivered" }
  | { state: "already" }
  | { state: "ok"; order: Order; option: string }

/** 이 상품에 후기를 쓸 수 있는지(구매자인지) 판단합니다. */
export function useReviewTarget(productId: string): ReviewTarget {
  const { user } = useUser()
  const orders = useApp((s) => s.orders)
  const reviews = useApp((s) => s.reviews)

  return useMemo<ReviewTarget>(() => {
    if (!user) return { state: "login" }

    const purchased = orders.filter((o) => o.userId === user.id && o.items.some((i) => i.productId === productId))
    if (purchased.length === 0) return { state: "no-purchase" }

    const reviewable = purchased.filter((o) => REVIEWABLE_STATUSES.includes(o.status))
    if (reviewable.length === 0) return { state: "not-delivered" }

    const open = reviewable.find((o) => !reviews.some((r) => r.orderId === o.id && r.productId === productId))
    if (!open) return { state: "already" }

    const item = open.items.find((i) => i.productId === productId)
    return { state: "ok", order: open, option: item ? optionLabel(item) : "" }
  }, [user, orders, reviews, productId])
}

/** productId를 주면 그 상품의 Q&A만, 생략하면 전체 Q&A. 관리자 답변이 있으면 반영합니다. */
export function useQuestions(productId?: string): Question[] {
  const hydrated = useHydrated()
  const stored = useApp((s) => s.questions)
  const answers = useApp((s) => s.answers)

  return useMemo(() => {
    const all = [...(hydrated ? stored : []), ...SEED_QUESTIONS].map((q) =>
      hydrated && answers[q.id] ? { ...q, answer: answers[q.id] } : q
    )
    const list = productId ? all.filter((q) => q.productId === productId) : all
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [hydrated, stored, answers, productId])
}
