import Image from "next/image"
import Link from "next/link"
import FeaturedPair from "@/components/products/FeaturedTile"
import ProductCard from "@/components/products/ProductCard"
import ServerNotice from "@/components/layout/ServerNotice"
import { getHomeFeaturedIds, getPublicProducts } from "@/lib/db/public"
import type { Product } from "@/lib/types"

// 상품 정보는 30초마다 새로 가져옵니다. (관리자가 바꾼 내용이 곧 반영돼요)
export const revalidate = 30

export default async function HomePage() {
  const { products, configured, failed } = await getPublicProducts()
  const featuredIds = await getHomeFeaturedIds()

  // 대표 상품 2개: 관리자가 고른 상품(판매 중인 것만) → 부족하면 순서상 앞의 상품으로 채웁니다.
  const picked = featuredIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p)
  const rest = products.filter((p) => !picked.includes(p))
  const featured = [...picked, ...rest.filter((p) => p.inStock), ...rest.filter((p) => !p.inStock)].slice(0, 2)

  return (
    <main>
      {/* 큰 사진 위에 문장 하나, 버튼 하나 */}
      <section className="relative isolate flex min-h-[72vh] items-center justify-center overflow-hidden bg-brown/20 md:min-h-[82vh]">
        <Image
          src="https://picsum.photos/seed/wellness-hero/1800/1200"
          alt=""
          fill
          priority
          className="-z-10 object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 -z-10 bg-brown/50" />
        <div className="px-6 py-24 text-center text-cream">
          <p className="eyebrow">ooro.</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.15] md:text-7xl">
            하루의 리듬을
            <br />
            되찾는 시간
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed">
            바쁜 일상 속, 몸과 마음이 잠시 멈춰 쉴 수 있도록. 정직한 성분과 절제된 만듦새로 완성한 웰니스 리추얼을 제안합니다.
          </p>
          <Link
            href="/products"
            className="mt-10 inline-flex items-center justify-center rounded-full border border-cream px-9 py-3.5 text-sm font-medium transition duration-300 ease-gentle hover:bg-cream hover:text-brown"
          >
            컬렉션 둘러보기
          </Link>
        </div>
      </section>

      {/* 대표 상품: 같은 카테고리의 사진 2장이 화면 폭 가득. 오른쪽 사진 안쪽 아래의 '제품 보러가기' → 그 카테고리 */}
      {configured && !failed && <FeaturedPair items={featured} />}

      {/* SHOP: 사진 / 이름·색상 / 가격·할인, 한 줄에 4개. 순서는 관리자 > 상품에서 바꿔요. */}
      <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
        <div className="flex items-end justify-between gap-4 border-b border-brown/15 pb-5">
          <div>
            <p className="eyebrow">All Products</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">SHOP</h2>
          </div>
          <Link href="/products" className="shrink-0 text-sm underline underline-offset-[6px]">
            전체 보기
          </Link>
        </div>

        {configured && !failed ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ServerNotice configured={configured} />
          </div>
        )}
      </section>
    </main>
  )
}
