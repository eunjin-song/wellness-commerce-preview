import type { Metadata } from "next"
import QnaBoard from "@/components/qna/QnaBoard"

export const metadata: Metadata = { title: "Q&A — ooro." }

export default function QnaPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="eyebrow">Q&amp;A</p>
      <h1 className="mt-3 font-display text-4xl">궁금한 점을 남겨주세요</h1>
      <p className="mt-3 text-sm">
        상품, 배송, 교환·환불 등 궁금한 점을 남겨주세요. 영업일 기준 1~2일 안에 답변드려요.
      </p>
      <div className="mt-10">
        <QnaBoard />
      </div>
    </main>
  )
}
