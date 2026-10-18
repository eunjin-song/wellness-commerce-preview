"use client"

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/lib/store/app"
import { SEED_QUESTIONS } from "@/lib/mock/qna"
import type { Product } from "@/lib/mock/products"
import type { Question, Review } from "@/lib/types"

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

export function useProductReviews(product: Product): Review[] {
  const hydrated = useHydrated()
  const stored = useApp((s) => s.reviews)

  return useMemo(() => {
    const seeded: Review[] = product.reviews.map((r) => ({ ...r, productId: product.id }))
    const mine = hydrated ? stored.filter((r) => r.productId === product.id) : []
    return [...mine, ...seeded].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [hydrated, stored, product])
}

/** productId를 주면 그 상품의 Q&A만, 생략하면 전체 Q&A */
export function useQuestions(productId?: string): Question[] {
  const hydrated = useHydrated()
  const stored = useApp((s) => s.questions)

  return useMemo(() => {
    const all = [...(hydrated ? stored : []), ...SEED_QUESTIONS]
    const list = productId ? all.filter((q) => q.productId === productId) : all
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [hydrated, stored, productId])
}
