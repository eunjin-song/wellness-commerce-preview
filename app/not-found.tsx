import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
      <p className="text-sm tracking-[0.2em] text-sage-600">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/50">
        찾으시는 페이지가 삭제되었거나, 주소가 바뀌었을 수 있어요.
      </p>
      <Link
        href="/"
        className="mt-10 inline-block rounded-full bg-sage-400 px-8 py-3.5 text-sm font-medium text-white
                   transition duration-300 ease-gentle hover:bg-sage-600"
      >
        홈으로 돌아가기
      </Link>
    </main>
  )
}
