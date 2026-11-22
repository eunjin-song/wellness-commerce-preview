"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { DEFAULT_SETTINGS, mapProduct, mapSettings, type ProductRow } from "@/lib/db/mappers"
import type { Category, ShopSettings } from "@/lib/types"

/** 배송비 설정 (DB의 shop_settings). 불러오기 전에는 기본값을 씁니다. */
export function useSettings(): ShopSettings {
  const { data } = useQuery({
    queryKey: ["settings"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) return DEFAULT_SETTINGS
      const { data, error } = await supabase.from("shop_settings").select("value").eq("key", "shipping").maybeSingle()
      if (error) throw error
      return mapSettings(data?.value)
    },
  })
  return data ?? DEFAULT_SETTINGS
}

/** 판매 중인 전체 상품 (찜 목록·Q&A 상품 선택 등에서 사용) */
export function usePublicProducts() {
  return useQuery({
    queryKey: ["products", "public"],
    staleTime: 60_000,
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) return []
      const { data, error } = await supabase
        .from("products_public")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
      if (error) throw error
      return (data as ProductRow[]).map(mapProduct)
    },
  })
}

/** 카테고리 목록 (관리자가 정한 순서). 상품 등록 화면의 선택 목록과 관리 화면에서 써요. */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 60_000,
    queryFn: async (): Promise<Category[]> => {
      const supabase = createClient()
      if (!supabase) return []
      const { data, error } = await supabase.from("categories").select("id, name, sort_order").order("sort_order", { ascending: true })
      if (error) throw error
      return (data as { id: string; name: string; sort_order: number }[]).map((c) => ({ id: c.id, name: c.name, sortOrder: c.sort_order }))
    },
  })
}
