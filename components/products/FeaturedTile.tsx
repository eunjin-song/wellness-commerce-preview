import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"

/** 카테고리 목록 화면 주소 (예: /products?category=슬립 케어) */
export const categoryHref = (category: string) => (category ? `/products?category=${encodeURIComponent(category)}` : "/products")

function FullImage({ product, href, priority }: { product: Product; href: string; priority: boolean }) {
  return (
    // 사진 링크는 아래 '제품 보러가기'와 같은 곳으로 가요. 키보드·화면 낭독에서는 글자 링크만 쓰이게 숨겨요.
    <Link href={href} tabIndex={-1} aria-hidden="true" className="group relative block aspect-[4/5] overflow-hidden bg-paper md:aspect-square">
      {product.images[0] && (
        <Image
          src={product.images[0]}
          alt=""
          fill
          priority={priority}
          className="object-cover transition duration-1000 ease-gentle group-hover:scale-[1.03]"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      )}
    </Link>
  )
}

/**
 * 홈 상단 대표 상품: 같은 카테고리의 제품 사진 2장을 화면 폭 가득 나란히 보여줘요.
 * 사진을 누르거나 오른쪽 사진 아래의 '제품 보러가기'를 누르면 그 카테고리 화면으로 이동해요.
 * 카테고리는 오른쪽 상품의 카테고리를 따릅니다. (관리자 > 상품에서 두 상품을 같은 카테고리로 고르세요)
 */
export default function FeaturedPair({ items }: { items: Product[] }) {
  if (items.length === 0) return null
  const right = items[items.length - 1]
  const left = items.length > 1 ? items[0] : null
  const href = categoryHref(right.category)
  const names = items.map((p) => p.name).join(" · ")

  return (
    <section aria-label="대표 상품" className="grid grid-cols-1 md:grid-cols-2">
      {left && <FullImage product={left} href={href} priority />}

      <div className={left ? "" : "md:col-span-2"}>
        <FullImage product={right} href={href} priority={!left} />
        <div className="px-6 py-10 text-center md:py-12">
          {right.category && <p className="eyebrow">{right.category}</p>}
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed">{names}</p>
          <Link href={href} className="mt-5 inline-block text-sm font-medium underline underline-offset-[6px]">
            제품 보러가기
            <span className="sr-only"> — {right.category || "전체 상품"}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
