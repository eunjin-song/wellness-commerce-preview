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
