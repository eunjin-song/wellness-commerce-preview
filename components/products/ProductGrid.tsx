"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import type { Product } from "@/lib/types"
import ProductCard from "@/components/products/ProductCard"

type SortKey = "default" | "price-asc" | "price-desc" | "name"

const SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "기본순" },
  { key: "price-asc", label: "낮은 가격순" },
  { key: "price-desc", label: "높은 가격순" },
  { key: "name", label: "이름순" },
]

export default function ProductGrid({ products }: { products: Product[] }) {
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 선택한 카테고리는 주소(?category=...)에 담아 둬서, 홈의 대표 상품에서 바로 이 화면으로 올 수 있고 링크로 공유도 돼요.
  const fromUrl = searchParams.get("category")
  const category = fromUrl && categories.includes(fromUrl) ? fromUrl : null
  const setCategory = (next: string | null) => {
    router.replace(next ? `${pathname}?category=${encodeURIComponent(next)}` : pathname, { scroll: false })
  }
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("default")

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    let list = category ? products.filter((p) => p.category === category) : products
    if (keyword) {
      list = list.filter((p) => `${p.name} ${p.subtitle} ${p.category}`.toLowerCase().includes(keyword))
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price)
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price)
    else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"))
    return list
  }, [products, category, query, sort])

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 border-b border-brown/15 pb-5" role="group" aria-label="카테고리">
        <button type="button" className="cat-tab" aria-pressed={category === null} onClick={() => setCategory(null)}>
          전체
        </button>
        {categories.map((c) => (
          <button key={c} type="button" className="cat-tab" aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-72">
          <label htmlFor="product-search" className="sr-only">
            상품 검색
          </label>
          <input
            id="product-search"
            type="search"
            className="field py-2.5"
            placeholder="상품 이름으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-xs" aria-live="polite">
            {visible.length}개 상품
          </p>
          <label htmlFor="product-sort" className="sr-only">
            정렬
          </label>
          <select id="product-sort" className="field w-auto py-2.5" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-sm">{query.trim() ? "검색 결과가 없어요. 다른 단어로 찾아보세요." : "등록된 상품이 없어요."}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
