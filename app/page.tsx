import Image from "next/image"
import Link from "next/link"
import { PRODUCTS } from "@/lib/mock/products"

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 3)

  return (
    <main>
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
        <div>
          <p className="text-sm tracking-[0.2em] text-brown">OORO.</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.15] text-brown md:text-6xl">
            하루의 리듬을
            <br />
            되찾는 시간
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-brown">
            바쁜 일상 속, 몸과 마음이 잠시 멈춰 쉴 수 있도록. 정직한 성분과
            절제된 만듦새로 완성한 웰니스 리추얼을 제안합니다.
          </p>
          <Link
            href="/products"
            className="mt-10 inline-block rounded-full bg-brown px-8 py-3.5 text-sm font-medium text-paper
                       transition duration-300 ease-gentle hover:bg-brown/85"
          >
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
          <h2 className="font-display text-3xl text-brown">이번 주 추천</h2>
          <Link href="/products" className="text-sm text-brown underline underline-offset-4">
            전체 보기
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {featured.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-brown/10">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition duration-500 ease-gentle group-hover:scale-105"
                  sizes="(min-width: 640px) 30vw, 90vw"
                />
              </div>
              <p className="mt-4 text-xs text-brown">{product.category}</p>
              <p className="mt-1 text-sm font-medium text-brown">{product.name}</p>
              <p className="mt-1 text-sm text-brown">{product.price.toLocaleString("ko-KR")}원</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
