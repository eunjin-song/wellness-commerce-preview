import Image from "next/image"
import Link from "next/link"
import ProductCard from "@/components/products/ProductCard"
import ServerNotice from "@/components/layout/ServerNotice"
import { getPublicProducts } from "@/lib/db/public"

// 상품 정보는 30초마다 새로 가져옵니다. (관리자가 바꾼 내용이 곧 반영돼요)
export const revalidate = 30

export default async function HomePage() {
  const { products, configured, failed } = await getPublicProducts()
  const featured = products.filter((p) => p.inStock).slice(0, 6)

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

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex items-end justify-between gap-4 border-b border-brown/15 pb-5">
          <div>
            <p className="eyebrow">New &amp; Recommended</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">이번 주 추천</h2>
          </div>
          <Link href="/products" className="shrink-0 text-sm underline underline-offset-[6px]">
            전체 보기
          </Link>
        </div>

        {configured && !failed ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ServerNotice configured={configured} />
          </div>
        )}
      </section>

      {/* 브랜드 이야기 맛보기 */}
      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-20 md:py-28">
          <div className="relative aspect-4/3 overflow-hidden rounded-md bg-brown/10">
            <Image
              src="https://picsum.photos/seed/wellness-about-1/1200/900"
              alt="원료 클로즈업"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 45vw, 92vw"
            />
          </div>
          <div>
            <p className="eyebrow">Brand Story</p>
            <h2 className="mt-4 font-display text-3xl leading-snug md:text-4xl">
              성분보다 먼저,
              <br />
              일상을 들여다봤습니다
            </h2>
            <p className="mt-6 max-w-md leading-relaxed">
              잠들기 전 뒤척이는 밤, 아침마다 반복되는 피로감. 그 사이사이에 놓일 수 있는 가장 단순한 형태의 제품을 만들고자 했습니다.
            </p>
            <Link href="/about" className="btn-outline mt-8">
              브랜드 이야기 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
