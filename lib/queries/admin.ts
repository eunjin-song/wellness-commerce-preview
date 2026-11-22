"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { requireClient } from "@/lib/supabase/client"
import { PUBLIC_BUCKET } from "@/lib/supabase/config"
import { useIsAdmin } from "@/lib/hooks"
import { mapAccount, mapAdminProduct, mapIrPost, mapOrder, mapReview, type ProductRow } from "@/lib/db/mappers"
import { removeIrFile, uploadImages, uploadIrFile } from "@/lib/storage"
import { salePrice } from "@/lib/pricing"
import type { Account, AdminProduct, IrPost, Order, OrderStatus, Review } from "@/lib/types"

/* 관리자 화면의 모든 조회·수정은 DB의 RLS가 "관리자인지" 다시 확인합니다. (화면에서 숨기는 것만으로 막지 않아요) */

export function useAdminProducts() {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "products"],
    enabled: isAdmin,
    queryFn: async (): Promise<AdminProduct[]> => {
      const { data, error } = await requireClient()
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
      if (error) throw error
      return (data as ProductRow[]).map(mapAdminProduct)
    },
  })
}

/** 상품 노출 순서 바꾸기: 상품 id를 원하는 순서대로 넘기면 서버가 1, 2, 3 ... 번호를 매겨요. */
export function useReorderProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await requireClient().rpc("reorder_products", { p_ids: ids })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

/** 카테고리 추가·이름 변경·삭제·순서 변경 (전부 관리자만 쓸 수 있는 서버 함수를 불러요) */
export function useCategoryMutations() {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] })
    // 이름 변경·삭제는 상품의 카테고리도 바꾸므로 상품 목록도 새로 읽어요.
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
    queryClient.invalidateQueries({ queryKey: ["products"] })
  }

  const add = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await requireClient().rpc("add_category", { p_name: name })
      if (error) throw error
    },
    onSuccess: refresh,
  })

  const rename = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await requireClient().rpc("rename_category", { p_id: id, p_name: name })
      if (error) throw error
    },
    onSuccess: refresh,
  })

  /** 삭제하고, 미분류가 된 상품 수를 돌려줘요 */
  const remove = useMutation({
    mutationFn: async (id: string): Promise<number> => {
      const { data, error } = await requireClient().rpc("delete_category", { p_id: id })
      if (error) throw error
      return typeof data === "number" ? data : 0
    },
    onSuccess: refresh,
  })

  const reorder = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await requireClient().rpc("reorder_categories", { p_ids: ids })
      if (error) throw error
    },
    onSuccess: refresh,
  })

  return { add, rename, remove, reorder }
}

/** 홈 화면 상단에 크게 보여줄 대표 상품 id 목록 (비어 있으면 순서상 앞의 두 상품을 보여줘요) */
export function useHomeFeatured() {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "home-featured"],
    enabled: isAdmin,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await requireClient().from("shop_settings").select("value").eq("key", "home_featured").maybeSingle()
      if (error) throw error
      const ids = (data?.value as { ids?: unknown } | null)?.ids
      return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []
    },
  })
}

export function useSaveHomeFeatured() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await requireClient().from("shop_settings").upsert({ key: "home_featured", value: { ids } })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "home-featured"] }),
  })
}

export interface SaveProductInput {
  id: string
  name: string
  subtitle: string
  /** 카테고리 이름 (목록에 있는 이름 또는 빈 값=미분류) */
  category: string
  /** 정가. 할인이 없으면 이 값이 그대로 판매가예요. */
  listPrice: number
  /** 할인율(%). 0이면 할인 없음 */
  discountPercent: number
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
          // 판매가는 정가와 할인율로 계산해요. (DB가 같은 규칙으로 한 번 더 맞춰서, 어긋나게 저장될 수 없어요)
          price: salePrice(input.listPrice, input.discountPercent),
          original_price: input.discountPercent > 0 ? input.listPrice : null,
          discount_percent: input.discountPercent,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      // 취소하면 재고가 되돌아가므로 상품 목록도 새로 읽어요.
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

/** 전체 회원 목록 (관리자만. RLS가 관리자에게만 모든 프로필을 보여줘요) */
export function useAdminMembers() {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "members"],
    enabled: isAdmin,
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await requireClient().from("profiles").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return (data as Parameters<typeof mapAccount>[0][]).map(mapAccount)
    },
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

/* ---------------- IR(공고·공시) ---------------- */

/** 관리자용 IR 목록: 숨김 글도 포함, 최신 게시일 순 */
export function useAdminIrPosts() {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "ir"],
    enabled: isAdmin,
    queryFn: async (): Promise<IrPost[]> => {
      const { data, error } = await requireClient()
        .from("ir_posts")
        .select("*")
        .order("published_at", { ascending: false })
        .order("id", { ascending: false })
      if (error) throw error
      return (data as Parameters<typeof mapIrPost>[0][]).map(mapIrPost)
    },
  })
}

export interface SaveIrPostInput {
  /** 있으면 수정, 없으면 새 글 */
  id?: number
  title: string
  author: string
  content: string
  /** YYYY-MM-DD */
  publishedAt: string
  isPublished: boolean
  /** 새로 올릴 파일 (없으면 기존 첨부를 유지) */
  newFile?: File | null
  /** true 면 기존 첨부를 지워요 (새 파일을 올리면 자동으로 교체돼요) */
  removeFile?: boolean
  /** 기존 첨부 (교체·삭제할 때 저장소에서도 지우기 위해) */
  existingFilePath?: string | null
  existingFileName?: string | null
}

export function useSaveIrPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SaveIrPostInput) => {
      let filePath = input.existingFilePath ?? null
      let fileName = input.existingFileName ?? null

      if (input.newFile) {
        const uploaded = await uploadIrFile(input.newFile)
        filePath = uploaded.path
        fileName = uploaded.name
      } else if (input.removeFile) {
        filePath = null
        fileName = null
      }

      const row = {
        title: input.title,
        author: input.author,
        content: input.content,
        published_at: input.publishedAt,
        is_published: input.isPublished,
        file_path: filePath,
        file_name: fileName,
      }
      const query = requireClient().from("ir_posts")
      const { error } = input.id ? await query.update(row).eq("id", input.id) : await query.insert(row)
      if (error) throw error

      // 저장이 끝난 뒤에 예전 파일을 정리해요. (저장이 실패하면 예전 파일은 그대로 남아요)
      if (input.existingFilePath && input.existingFilePath !== filePath) await removeIrFile(input.existingFilePath)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ir"] }),
  })
}

export function useDeleteIrPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (post: IrPost) => {
      const { error } = await requireClient().from("ir_posts").delete().eq("id", post.id)
      if (error) throw error
      await removeIrFile(post.filePath)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ir"] }),
  })
}
