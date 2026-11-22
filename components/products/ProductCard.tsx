import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { hasPriceVariation } from "@/lib/pricing"
import { won } from "@/lib/format"
import HeartButton from "@/components/products/HeartButton"

// 사진을 크게, 글은 작게 — 이름과 가격만 사진 아래에 조용히 놓습니다.
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
              sizes="(min-width: 1024px) 30vw, 46vw"
            />
          )}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream/60">
              <span className="rounded-full bg-brown px-4 py-1.5 text-xs text-paper">일시 품절</span>
            </div>
          )}
        </div>

        <p className="eyebrow mt-4 text-[11px]">{product.category}</p>
        <p className="mt-1.5 text-sm font-medium leading-snug">{product.name}</p>
        {product.subtitle && <p className="mt-1 hidden text-xs leading-snug md:block">{product.subtitle}</p>}

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm">
            {won(product.price)}
            {hasPriceVariation(product) && "~"}
          </p>
          {product.colors.length > 0 && (
            <span className="flex gap-1" aria-label={`색상 ${product.colors.map((c) => c.name).join(", ")}`}>
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  className="h-3 w-3 rounded-full border border-brown/30"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </span>
          )}
        </div>
      </Link>

      <HeartButton productId={product.id} className="absolute right-2.5 top-2.5 bg-paper/90 hover:bg-paper" />
    </div>
  )
}
