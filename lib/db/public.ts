import "server-only"
import { createPublicClient } from "@/lib/supabase/server"
import { mapProduct, type ProductRow } from "@/lib/db/mappers"
import type { Product } from "@/lib/types"

/** 서버에서 쓰는 공개 상품 조회 (비회원과 같은 권한). 판매 중인 상품만 나옵니다. */
export async function getPublicProducts(): Promise<{ products: Product[]; configured: boolean; failed: boolean }> {
  const supabase = createPublicClient()
  if (!supabase) return { products: [], configured: false, failed: false }

  const { data, error } = await supabase
    .from("products_public")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    console.error("상품 목록을 불러오지 못했어요:", error.message)
    return { products: [], configured: true, failed: true }
  }
  return { products: (data as ProductRow[]).map(mapProduct), configured: true, failed: false }
}

export async function getPublicProduct(id: string): Promise<{ product: Product | null; configured: boolean; failed: boolean }> {
  const supabase = createPublicClient()
  if (!supabase) return { product: null, configured: false, failed: false }

  const { data, error } = await supabase.from("products_public").select("*").eq("id", id).maybeSingle()
  if (error) {
    console.error("상품을 불러오지 못했어요:", error.message)
    return { product: null, configured: true, failed: true }
  }
  return { product: data ? mapProduct(data as ProductRow) : null, configured: true, failed: false }
}

/**
 * 홈 화면 상단의 대표 상품 id 목록 (관리자가 고른 것). 설정이 없거나 비어 있으면 빈 배열입니다.
 * 고른 상품이 숨김·삭제됐을 때의 대체는 화면(홈)에서 처리해요.
 */
export async function getHomeFeaturedIds(): Promise<string[]> {
  const supabase = createPublicClient()
  if (!supabase) return []

  const { data, error } = await supabase.from("shop_settings").select("value").eq("key", "home_featured").maybeSingle()
  if (error) {
    console.error("홈 대표 상품 설정을 불러오지 못했어요:", error.message)
    return []
  }
  const ids = (data?.value as { ids?: unknown } | null)?.ids
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []
}
