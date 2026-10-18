"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient, requireClient } from "@/lib/supabase/client"
import { PUBLIC_BUCKET, QUESTION_BUCKET } from "@/lib/supabase/config"
import { useAuthState } from "@/lib/auth"
import { mapQuestion, mapReview } from "@/lib/db/mappers"
import { uploadImages } from "@/lib/storage"
import { optionLabel } from "@/lib/store/cart"
import { REVIEWABLE_STATUSES } from "@/lib/shop"
import { useMyOrders } from "@/lib/queries/account"
import type { Order, Question, Review } from "@/lib/types"

/* ---------------- 후기 ---------------- */

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async (): Promise<Review[]> => {
      const supabase = createClient()
      if (!supabase) return []
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data as Parameters<typeof mapReview>[0][]).map(mapReview)
    },
  })
}

export type ReviewTarget =
  | { state: "login" }
  | { state: "loading" }
  | { state: "no-purchase" }
  | { state: "not-delivered" }
  | { state: "already" }
  | { state: "ok"; order: Order; option: string }

/** 이 상품에 후기를 쓸 수 있는지(구매자·배송 완료·미작성) 판단합니다. 최종 검사는 DB가 다시 합니다. */
export function useReviewTarget(productId: string): ReviewTarget {
  const { ready, authUser } = useAuthState()
  const orders = useMyOrders()
  const mine = useQuery({
    queryKey: ["my-reviews", authUser?.id],
    enabled: authUser !== null,
    queryFn: async () => {
      const { data, error } = await requireClient().from("reviews").select("order_id, product_id").eq("user_id", authUser!.id)
      if (error) throw error
      return data as { order_id: string | null; product_id: string }[]
    },
  })

  return useMemo<ReviewTarget>(() => {
    if (!ready) return { state: "loading" }
    if (!authUser) return { state: "login" }
    if (!orders.data || !mine.data) return { state: "loading" }

    const purchased = orders.data.filter((o) => o.items.some((i) => i.productId === productId))
    if (purchased.length === 0) return { state: "no-purchase" }

    const reviewable = purchased.filter((o) => REVIEWABLE_STATUSES.includes(o.status))
    if (reviewable.length === 0) return { state: "not-delivered" }

    const open = reviewable.find((o) => !mine.data.some((r) => r.order_id === o.id && r.product_id === productId))
    if (!open) return { state: "already" }

    const item = open.items.find((i) => i.productId === productId)
    return { state: "ok", order: open, option: item ? optionLabel(item) : "" }
  }, [ready, authUser, orders.data, mine.data, productId])
}

export function useAddReview() {
  const { authUser } = useAuthState()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { productId: string; orderId: string; rating: number; content: string; option: string; images: string[] }) => {
      if (!authUser) throw new Error("not_authenticated")
      const urls = await uploadImages(PUBLIC_BUCKET, `reviews/${authUser.id}`, input.images)
      const { error } = await requireClient().from("reviews").insert({
        product_id: input.productId,
        order_id: input.orderId,
        rating: input.rating,
        content: input.content,
        option_label: input.option,
        images: urls,
      })
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.productId] })
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] })
    },
  })
}

/* ---------------- Q&A ---------------- */

/** productId 를 주면 그 상품의 Q&A만, 생략하면 전체. 비밀글은 서버가 가려서 내려줍니다. */
export function useQuestions(productId?: string) {
  const { ready, authUser } = useAuthState()
  return useQuery({
    queryKey: ["questions", productId ?? "all", authUser?.id ?? "guest"],
    enabled: ready,
    queryFn: async (): Promise<Question[]> => {
      const supabase = createClient()
      if (!supabase) return []
      let query = supabase.from("questions_feed").select("*").order("created_at", { ascending: false })
      if (productId) query = query.eq("product_id", productId)
      const { data, error } = await query
      if (error) throw error
      return (data as Parameters<typeof mapQuestion>[0][]).map(mapQuestion)
    },
  })
}

export function useCreateQuestion() {
  const { authUser } = useAuthState()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { productId: string | null; title: string; content: string; isSecret: boolean; images: string[] }) => {
      if (!authUser) throw new Error("not_authenticated")
      const paths = await uploadImages(QUESTION_BUCKET, authUser.id, input.images)
      const { error } = await requireClient().from("questions").insert({
        product_id: input.productId,
        title: input.title,
        content: input.content,
        is_secret: input.isSecret,
        images: paths,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questions"] }),
  })
}

/** Q&A 첨부 사진은 비공개라서, 볼 수 있는 사람에게만 1시간짜리 임시 주소를 받아 보여줍니다. */
export function useSignedUrls(paths: string[]) {
  const key = paths.join("|")
  return useQuery({
    queryKey: ["signed-urls", key],
    enabled: paths.length > 0,
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await requireClient().storage.from(QUESTION_BUCKET).createSignedUrls(paths, 3600)
      if (error) throw error
      return data.map((d) => d.signedUrl).filter((u): u is string => typeof u === "string")
    },
  })
}
