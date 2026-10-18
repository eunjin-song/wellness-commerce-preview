"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { requireClient } from "@/lib/supabase/client"
import { PUBLIC_BUCKET } from "@/lib/supabase/config"
import { useIsAdmin } from "@/lib/hooks"
import { mapAdminProduct, mapOrder, mapReview, type ProductRow } from "@/lib/db/mappers"
import { uploadImages } from "@/lib/storage"
import type { AdminProduct, Order, OrderStatus, Review } from "@/lib/types"

/* 관리자 화면의 모든 조회·수정은 DB의 RLS가 "관리자인지" 다시 확인합니다. (화면에서 숨기는 것만으로 막지 않아요) */

export function useAdminProducts() {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "products"],
    enabled: isAdmin,
    queryFn: async (): Promise<AdminProduct[]> => {
      const { data, error } = await requireClient().from("products").select("*").order("created_at", { ascending: true })
      if (error) throw error
      return (data as ProductRow[]).map(mapAdminProduct)
    },
  })
}

export interface SaveProductInput {
  id: string
  name: string
  subtitle: string
  category: string
  price: number
  stock: number
  isActive: boolean
  /** 새로 고른 사진은 data URL, 기존 사진은 주소 */
  images: string[]
  colors: { name: string; hex: string; extra: number }[]
  sizes: { name: string; extra: number }[]
  ingredients: string
  usageGuide: string
  description: string
}

export function useSaveProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SaveProductInput) => {
      const images = await uploadImages(PUBLIC_BUCKET, `products/${input.id}`, input.images)
      const { error } = await requireClient()
        .from("products")
        .upsert({
          id: input.id,
          name: input.name,
          subtitle: input.subtitle,
          category: input.category,
          price: input.price,
          stock: input.stock,
          is_active: input.isActive,
          images,
          colors: input.colors,
          sizes: input.sizes,
          ingredients: input.ingredients,
          usage_guide: input.usageGuide,
          description: input.description,
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useSetProductActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await requireClient().from("products").update({ is_active: isActive }).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireClient().from("products").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useAdminOrders() {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "orders"],
    enabled: isAdmin,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await requireClient().from("orders").select("*, order_items(*)").order("created_at", { ascending: false })
      if (error) throw error
      return (data as Parameters<typeof mapOrder>[0][]).map(mapOrder)
    },
  })
}

export function useSetOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await requireClient().from("orders").update({ status }).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
  })
}

export function useAdminReviews() {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "reviews"],
    enabled: isAdmin,
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await requireClient().from("reviews").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return (data as Parameters<typeof mapReview>[0][]).map(mapReview)
    },
  })
}

export function useSetReviewHidden() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      const { error } = await requireClient().from("reviews").update({ is_hidden: hidden }).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] })
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
  })
}

export function useAnswerQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => {
      const { error } = await requireClient()
        .from("questions")
        .update({ answer, answered_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questions"] }),
  })
}

export function useSetShippingSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ fee, freeThreshold }: { fee: number; freeThreshold: number }) => {
      const { error } = await requireClient()
        .from("shop_settings")
        .upsert({ key: "shipping", value: { fee, free_threshold: freeThreshold } })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  })
}
