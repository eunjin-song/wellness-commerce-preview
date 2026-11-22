import type { MetadataRoute } from "next"
import { getPublicProducts } from "@/lib/db/public"
import { SITE_URL } from "@/lib/site"

export const revalidate = 3600

// 검색 엔진에 알려줄 페이지 목록: 고정 페이지 + 판매 중인 상품
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getPublicProducts()

  const pages = ["", "/about", "/products", "/qna", "/ir", "/terms", "/privacy"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }))
  const items = products.map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))
  return [...pages, ...items]
}
