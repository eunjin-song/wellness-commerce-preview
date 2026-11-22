import "server-only"
import { createPublicClient } from "@/lib/supabase/server"
import { mapIrPost, mapProduct, type ProductRow } from "@/lib/db/mappers"
import type { IrPost, Product } from "@/lib/types"

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

/**
 * 카테고리 이름 목록 (관리자가 정한 순서). 고객 화면의 카테고리 탭에 써요.
 * 불러오지 못하면 빈 배열이라서, 화면은 '전체'만 보여줘요.
 */
export async function getCategoryNames(): Promise<string[]> {
  const supabase = createPublicClient()
  if (!supabase) return []

  const { data, error } = await supabase.from("categories").select("name").order("sort_order", { ascending: true })
  if (error) {
    console.error("카테고리를 불러오지 못했어요:", error.message)
    return []
  }
  return (data as { name: string }[]).map((c) => c.name)
}

export const IR_PAGE_SIZE = 10

/** IR 목록 한 페이지 (최신 게시일 순). 방문자와 같은 권한이라 공개된 글만 나와요. */
export async function getIrPosts(page: number): Promise<{ posts: IrPost[]; total: number; configured: boolean; failed: boolean }> {
  const supabase = createPublicClient()
  if (!supabase) return { posts: [], total: 0, configured: false, failed: false }

  const from = (page - 1) * IR_PAGE_SIZE

  // 글 수를 먼저 세요. 글 수보다 큰 페이지 번호로 범위를 요청하면 서버가 오류를 내서,
  // 그런 경우에는 빈 목록과 전체 글 수만 돌려주고 화면이 마지막 페이지로 보내게 해요.
  const counted = await supabase.from("ir_posts").select("id", { count: "exact", head: true })
  if (counted.error) {
    console.error("IR 글 수를 세지 못했어요:", counted.error.message)
    return { posts: [], total: 0, configured: true, failed: true }
  }
  const totalCount = counted.count ?? 0
  if (totalCount > 0 && from >= totalCount) return { posts: [], total: totalCount, configured: true, failed: false }

  const { data, error, count } = await supabase
    .from("ir_posts")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + IR_PAGE_SIZE - 1)
  if (error) {
    console.error("IR 목록을 불러오지 못했어요:", error.message)
    return { posts: [], total: 0, configured: true, failed: true }
  }
  return { posts: (data as Parameters<typeof mapIrPost>[0][]).map(mapIrPost), total: count ?? 0, configured: true, failed: false }
}

/** IR 글 하나. 공개된 글이 아니면 null */
export async function getIrPost(id: number): Promise<{ post: IrPost | null; configured: boolean; failed: boolean }> {
  const supabase = createPublicClient()
  if (!supabase) return { post: null, configured: false, failed: false }

  const { data, error } = await supabase.from("ir_posts").select("*").eq("id", id).maybeSingle()
  if (error) {
    console.error("IR 글을 불러오지 못했어요:", error.message)
    return { post: null, configured: true, failed: true }
  }
  return { post: data ? mapIrPost(data as Parameters<typeof mapIrPost>[0]) : null, configured: true, failed: false }
}
