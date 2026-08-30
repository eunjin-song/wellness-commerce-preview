"use client"

import { useState } from "react"
import type { MockReview } from "@/lib/mock/products"

const TABS = ["상세 정보", "사용 방법", "구매 후기/Q&A"] as const

export default function ProductTabs({
  description,
  usageGuide,
  reviews,
}: {
  description: string
  usageGuide: string
  reviews: MockReview[]
}) {
  const [active, setActive] = useState<(typeof TABS)[number]>(TABS[0])

  return (
    <div>
      <div className="flex gap-8 border-b border-sage-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`relative pb-4 text-sm transition-colors
              ${active === tab ? "font-medium text-ink" : "text-ink/40 hover:text-ink/70"}`}
          >
            {tab}
            {active === tab && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-sage-400" />
            )}
          </button>
        ))}
      </div>

      <div className="py-10 font-sans text-sm leading-relaxed text-ink/70">
        {active === "상세 정보" && <div className="whitespace-pre-line">{description}</div>}
        {active === "사용 방법" && <div className="whitespace-pre-line">{usageGuide}</div>}
        {active === "구매 후기/Q&A" && <ReviewsSection initialReviews={reviews} />}
      </div>
    </div>
  )
}

function ReviewsSection({ initialReviews }: { initialReviews: MockReview[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setReviews((prev) => [
      {
        id: `local-${Date.now()}`,
        rating,
        content: content.trim(),
        author: "나",
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
    setContent("")
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-2xl bg-sage-50 p-6">
        <p className="text-sm font-medium text-sage-900">구매하신 상품은 어떠셨나요?</p>

        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n}점`}
              className={`text-2xl leading-none ${n <= rating ? "text-sage-400" : "text-ink/20"}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="솔직한 사용 후기를 남겨주세요."
          className="mt-3 w-full resize-none rounded-xl border border-sage-200 bg-white px-4 py-3 text-sm outline-none
                     transition focus:border-sage-400 focus:ring-1 focus:ring-sage-400"
        />

        <button
          type="submit"
          className="mt-3 rounded-full bg-sage-400 px-6 py-2.5 text-sm font-medium text-white
                     transition duration-300 ease-gentle hover:bg-sage-600"
        >
          후기 등록
        </button>
      </form>

      {reviews.length === 0 ? (
        <p className="text-ink/40">아직 등록된 후기가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-sage-200">
          {reviews.map((r) => (
            <li key={r.id} className="py-6 first:pt-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-sage-400">
                  <span>{"★".repeat(r.rating)}</span>
                  <span className="text-ink/15">{"★".repeat(5 - r.rating)}</span>
                </div>
                <span className="text-xs text-ink/30">{r.author}</span>
              </div>
              <p className="mt-2 text-ink/70">{r.content}</p>
              <p className="mt-2 text-xs text-ink/30">{r.createdAt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
