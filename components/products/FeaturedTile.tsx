import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"

/** 카테고리 목록 화면 주소 (예: /products?category=슬립 케어) */
export const categoryHref = (category: string) => (category ? `/products?category=${encodeURIComponent(category)}` : "/products")

function FullImage({ product, href, priority }: { product: Product; href: string; priority: boolean }) {
  return (
    // 사진 링크는 '제품 보러가기'와 같은 곳으로 가요. 키보드·화면 낭독에서는 글자 버튼만 쓰이게 숨겨요.
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
 * 글은 없이, 오른쪽 사진 안쪽 아래에 '제품 보러가기' 버튼만 있어요.
 * 사진을 누르거나 이 버튼을 누르면 그 카테고리 화면으로 이동해요.
 * 카테고리는 오른쪽 상품의 카테고리를 따릅니다. (관리자 > 상품에서 두 상품을 같은 카테고리로 고르세요)
 */
export default function FeaturedPair({ items }: { items: Product[] }) {
  if (items.length === 0) return null
  const right = items[items.length - 1]
  const left = items.length > 1 ? items[0] : null
  const href = categoryHref(right.category)

  return (
    <section aria-label="대표 상품" className="grid grid-cols-1 md:grid-cols-2">
      {left && <FullImage product={left} href={href} priority />}

      <div className={`relative ${left ? "" : "md:col-span-2"}`}>
        <FullImage product={right} href={href} priority={!left} />
        <Link
          href={href}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream px-8 py-3.5 text-sm font-medium text-brown shadow-sm transition duration-300 ease-gentle hover:bg-brown hover:text-cream md:bottom-10"
        >
          제품 보러가기
          <span className="sr-only"> — {right.category || "전체 상품"}</span>
        </Link>
      </div>
    </section>
  )
}
