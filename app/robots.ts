import type { MetadataRoute } from "next"
import { SITE_URL, allowIndexing } from "@/lib/site"

// 오픈 전에는 모든 검색 엔진의 수집을 막고, 오픈 후에는 고객 전용 화면만 빼고 허용합니다.
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/mypage", "/cart", "/checkout", "/auth", "/reset-password"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
