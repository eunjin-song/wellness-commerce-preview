import Image from "next/image"

export default function AboutPage() {
  return (
    <main>
      <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src="https://picsum.photos/seed/wellness-about-hero/1600/1000"
          alt="ooro. 브랜드 무드"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brown/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-cream">
          <p className="text-sm tracking-[0.25em]">OUR PHILOSOPHY</p>
          <h1 className="mt-4 font-display text-4xl leading-snug md:text-5xl">
            멈춤이 있어야, 다시 걸을 수 있습니다
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display text-2xl leading-relaxed text-brown md:text-3xl">
          우리는 더 잘 쉬는 법을 잃어버린 시대에,
          <br />
          작은 리추얼 하나로 하루의 리듬을 되돌려주고 싶었습니다.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-24 md:grid-cols-2">
        <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] bg-brown/10 md:order-2">
          <Image
            src="https://picsum.photos/seed/wellness-about-1/900/1125"
            alt="원료 클로즈업"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 45vw, 92vw"
          />
        </div>
        <div className="md:order-1">
          <p className="text-sm tracking-[0.2em] text-brown">STORY</p>
          <h2 className="mt-4 font-display text-3xl text-brown">
            성분보다 먼저,
            <br />
            일상을 들여다봤습니다
          </h2>
          <p className="mt-6 leading-relaxed text-brown">
            ooro.는 화려한 효능 문구 대신, 실제로 사용하는 사람의
            하루를 먼저 관찰하는 것에서 시작했습니다. 잠들기 전 뒤척이는 밤,
            아침마다 반복되는 피로감 — 그 사이사이에 놓일 수 있는 가장
            단순한 형태의 제품을 만들고자 했습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-32 md:grid-cols-2">
        <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] bg-brown/10">
          <Image
            src="https://picsum.photos/seed/wellness-about-2/900/1125"
            alt="사용 장면"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 45vw, 92vw"
          />
        </div>
        <div>
          <p className="text-sm tracking-[0.2em] text-brown">VALUE</p>
          <h2 className="mt-4 font-display text-3xl text-brown">
            정직한 성분,
            <br />
            절제된 만듦새
          </h2>
          <ul className="mt-6 space-y-5 text-brown">
            <li className="border-l-2 border-brown/25 pl-4">
              <p className="font-medium text-brown">필요한 성분만, 최소한으로</p>
              <p className="mt-1 text-sm leading-relaxed">
                효능이 검증된 성분만을 선별해 최소한의 구성으로 제품을 완성합니다.
              </p>
            </li>
            <li className="border-l-2 border-brown/25 pl-4">
              <p className="font-medium text-brown">매일 반복해도 부담 없이</p>
              <p className="mt-1 text-sm leading-relaxed">
                하루의 루틴이 될 수 있도록, 자극 없는 사용감을 가장 중요하게 여깁니다.
              </p>
            </li>
            <li className="border-l-2 border-brown/25 pl-4">
              <p className="font-medium text-brown">비워내는 디자인</p>
              <p className="mt-1 text-sm leading-relaxed">
                불필요한 장식을 덜어낸 패키지로, 공간에 놓였을 때도 편안함을 더합니다.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
