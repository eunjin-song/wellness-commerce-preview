import Image from "next/image"
import Link from "next/link"
import FeaturedProducts from "@/components/products/FeaturedProducts"

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
        <div>
          <p className="text-sm tracking-[0.2em]">OORO.</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.15] md:text-6xl">
            하루의 리듬을
            <br />
            되찾는 시간
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed">
            바쁜 일상 속, 몸과 마음이 잠시 멈춰 쉴 수 있도록. 정직한 성분과
            절제된 만듦새로 완성한 웰니스 리추얼을 제안합니다.
          </p>
          <Link href="/products" className="btn-primary mt-10 px-8 py-3.5">
            컬렉션 둘러보기
          </Link>
        </div>

        <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] bg-brown/10">
          <Image
            src="https://picsum.photos/seed/wellness-hero/900/1125"
            alt="ooro. 무드 이미지"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 45vw, 92vw"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">이번 주 추천</h2>
          <Link href="/products" className="text-sm underline underline-offset-4">
            전체 보기
          </Link>
        </div>
        <FeaturedProducts />
      </section>
    </main>
  )
}
