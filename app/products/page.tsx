import Image from "next/image"
import Link from "next/link"
import { PRODUCTS } from "@/lib/mock/products"

export default function ProductListPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl text-ink">전체 컬렉션</h1>
      <p className="mt-3 text-ink/50">몸과 마음의 리듬을 위한 웰니스 제품들을 만나보세요.</p>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="group">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-dark">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition duration-500 ease-gentle group-hover:scale-105"
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                  <span className="rounded-full bg-cream px-4 py-1.5 text-xs text-ink">일시 품절</span>
                </div>
              )}
            </div>
            <p className="mt-4 text-xs text-sage-600">{product.category}</p>
            <p className="mt-1 text-sm font-medium text-ink">{product.name}</p>
            <p className="mt-1 text-xs text-ink/40">{product.subtitle}</p>
            <p className="mt-2 text-sm text-ink/70">{product.price.toLocaleString("ko-KR")}원</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
