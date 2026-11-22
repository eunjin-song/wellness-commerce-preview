import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "브랜드 이야기 — ooro.",
  description: "멈춤이 있어야 다시 걸을 수 있습니다. ooro.가 제품을 만드는 방식과 가치를 소개합니다.",
}

const VALUES = [
  {
    title: "필요한 성분만, 최소한으로",
    body: "효능이 검증된 성분만을 선별해 최소한의 구성으로 제품을 완성합니다.",
  },
  {
    title: "매일 반복해도 부담 없이",
    body: "하루의 루틴이 될 수 있도록, 자극 없는 사용감을 가장 중요하게 여깁니다.",
  },
  {
    title: "비워내는 디자인",
    body: "불필요한 장식을 덜어낸 패키지로, 공간에 놓였을 때도 편안함을 더합니다.",
  },
]

// 좁은 한 줄 기둥: 사진 → 편지 같은 글 → 사진 → 가치 세 가지
export default function AboutPage() {
  return (
    <main className="pb-24 md:pb-32">
      <header className="mx-auto max-w-2xl px-6 pb-12 pt-16 text-center md:pb-16 md:pt-24">
        <p className="eyebrow">About</p>
        <h1 className="mt-5 font-display text-4xl leading-snug md:text-5xl">
          멈춤이 있어야,
          <br />
          다시 걸을 수 있습니다
        </h1>
      </header>

      <div className="mx-auto max-w-xl px-6">
        <div className="relative aspect-4/5 overflow-hidden rounded-md bg-brown/10">
          <Image
            src="https://picsum.photos/seed/wellness-about-hero/1000/1250"
            alt="ooro. 브랜드 무드"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 576px, 92vw"
          />
        </div>
      </div>

      <section className="mx-auto max-w-xl space-y-8 px-6 py-16 text-center md:py-24">
        <p className="font-display text-2xl leading-relaxed md:text-3xl">
          우리는 더 잘 쉬는 법을 잃어버린 시대에,
          <br />
          작은 리추얼 하나로 하루의 리듬을
          <br />
          되돌려주고 싶었습니다.
        </p>
        <p className="leading-loose">
          ooro.는 화려한 효능 문구 대신, 실제로 사용하는 사람의 하루를 먼저 관찰하는 것에서 시작했습니다. 잠들기 전 뒤척이는 밤,
          아침마다 반복되는 피로감. 그 사이사이에 놓일 수 있는 가장 단순한 형태의 제품을 만들고자 했습니다.
        </p>
      </section>

      <div className="mx-auto max-w-4xl px-6">
        <div className="relative aspect-3/2 overflow-hidden rounded-md bg-brown/10">
          <Image
            src="https://picsum.photos/seed/wellness-about-2/1600/1066"
            alt="사용 장면"
            fill
            className="object-cover"
            sizes="(min-width: 896px) 896px, 92vw"
          />
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 pt-20 md:pt-28">
        <p className="eyebrow text-center">Value</p>
        <h2 className="mt-4 text-center font-display text-3xl md:text-4xl">정직한 성분, 절제된 만듦새</h2>
        <ol className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {VALUES.map((v, i) => (
            <li key={v.title} className="border-t border-brown/25 pt-6">
              <p className="font-display text-2xl">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-4 font-medium">{v.title}</p>
              <p className="mt-2 text-sm leading-relaxed">{v.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-20 text-center md:mt-28">
        <Link href="/products" className="btn-outline px-9 py-3.5">
          컬렉션 둘러보기
        </Link>
      </div>
    </main>
  )
}
