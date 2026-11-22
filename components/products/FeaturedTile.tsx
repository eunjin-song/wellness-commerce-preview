import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"

/** 상품이 속한 카테고리 목록 화면 주소 */
export const categoryHref = (category: string) => (category ? `/products?category=${encodeURIComponent(category)}` : "/products")

/**
 * 홈 상단의 대표 상품 타일. 사진과 "제품 보러가기" 글자 버튼 모두 해당 상품의 카테고리 화면으로 이동해요.
 * (사진 링크와 글자 링크가 같은 곳을 가리켜서, 키보드·화면 낭독에서는 글자 링크만 읽히게 합니다.)
 */
export default function FeaturedTile({ product, priority = false }: { product: Product; priority?: boolean }) {
  const href = categoryHref(product.category)

  return (
    <div className="group">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/5] overflow-hidden rounded-md bg-paper ring-1 ring-brown/15 md:aspect-square">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt=""
            fill
            priority={priority}
            className="object-cover transition duration-700 ease-gentle group-hover:scale-[1.03]"
            sizes="(min-width: 1152px) 560px, (min-width: 768px) 46vw, 92vw"
          />
        )}
      </Link>

      <div className="mt-6 text-center">
        {product.category && <p className="eyebrow">{product.category}</p>}
        <h3 className="mt-3 font-display text-3xl leading-tight md:text-4xl">{product.name}</h3>
        {product.subtitle && <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed">{product.subtitle}</p>}
        <Link href={href} className="mt-5 inline-block text-sm font-medium underline underline-offset-[6px]">
          제품 보러가기
          <span className="sr-only"> — {product.category || "전체 상품"}</span>
        </Link>
      </div>
    </div>
  )
}
