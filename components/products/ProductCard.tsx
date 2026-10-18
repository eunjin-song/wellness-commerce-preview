import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/mock/products"
import { hasPriceVariation } from "@/lib/pricing"
import { won } from "@/lib/format"
import HeartButton from "@/components/products/HeartButton"

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-brown/10">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-500 ease-gentle group-hover:scale-105"
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-brown/50">
              <span className="rounded-full bg-cream px-4 py-1.5 text-xs">일시 품절</span>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs">{product.category}</p>
        <p className="mt-1 text-sm font-medium">{product.name}</p>
        <p className="mt-1 text-xs">{product.subtitle}</p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm">
            {won(product.price)}
            {hasPriceVariation(product) && "~"}
          </p>
          {product.colors && (
            <span className="flex gap-1" aria-label={`색상 ${product.colors.map((c) => c.name).join(", ")}`}>
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  className="h-3.5 w-3.5 rounded-full border border-brown/30"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </span>
          )}
        </div>
      </Link>

      <HeartButton productId={product.id} className="absolute right-3 top-3 bg-paper/90 hover:bg-paper" />
    </div>
  )
}
