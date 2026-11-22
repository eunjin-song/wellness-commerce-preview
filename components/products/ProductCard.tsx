import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { discountPercent, hasPriceVariation } from "@/lib/pricing"
import { won } from "@/lib/format"
import HeartButton from "@/components/products/HeartButton"

/** 가격과 할인 정보: 정가(취소선) → 할인율 → 판매가 */
export function PriceLine({ product, className = "" }: { product: Product; className?: string }) {
  const percent = discountPercent(product)
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      {percent !== null && product.originalPrice !== null && (
        <>
          <span className="sr-only">정가</span>
          <s className="text-xs opacity-60">{won(product.originalPrice)}</s>
        </>
      )}
      {percent !== null && (
        <span className="text-sm font-semibold" aria-label={`${percent}퍼센트 할인`}>
          {percent}%
        </span>
      )}
      <span className="text-sm font-medium tabular-nums">
        {won(product.price)}
        {hasPriceVariation(product) && "~"}
      </span>
    </p>
  )
}

// 큰 사진 → 이름 → 색상 → 가격·할인. 사진을 누르면 상세 페이지로 가요.
export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-paper ring-1 ring-brown/15">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition duration-700 ease-gentle group-hover:scale-[1.04]"
              sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
            />
          )}
          {/* 품절: 사진은 그대로 두고, 사진 맨 아래에 사진 폭만큼의 흰 띠로 SOLD OUT 을 가운데 정렬해요 */}
          {!product.inStock && (
            <div className="absolute inset-x-0 bottom-0 bg-cream py-2.5 text-center text-xs font-medium tracking-[0.25em] md:py-3">
              SOLD OUT
              <span className="sr-only"> (일시 품절)</span>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm font-medium leading-snug">{product.name}</p>

        {product.colors.length > 0 && (
          <span className="mt-2 flex gap-1.5" aria-label={`색상 ${product.colors.map((c) => c.name).join(", ")}`}>
            {product.colors.map((c) => (
              <span key={c.name} className="h-3 w-3 rounded-full border border-brown/30" style={{ backgroundColor: c.hex }} />
            ))}
          </span>
        )}

        <PriceLine product={product} className="mt-2" />
      </Link>

      <HeartButton productId={product.id} className="absolute right-2.5 top-2.5 bg-paper/90 hover:bg-paper" />
    </div>
  )
}
