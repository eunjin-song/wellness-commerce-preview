"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import type { Product } from "@/lib/mock/products"
import { useApp } from "@/lib/store/app"
import { useProductReviews, useUser } from "@/lib/hooks"
import { maskName } from "@/lib/format"

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`별점 ${value}점`} className="tracking-tight">
      <span>{"★".repeat(value)}</span>
      <span className="text-brown/25">{"★".repeat(5 - value)}</span>
    </span>
  )
}

export default function ReviewSection({ product }: { product: Product }) {
  const { user } = useUser()
  const pathname = usePathname()
  const reviews = useProductReviews(product)
  const addReview = useApp((s) => s.addReview)

  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!content.trim()) {
      setError("후기 내용을 입력해 주세요.")
      return
    }
    addReview({
      productId: product.id,
      userId: user.id,
      author: maskName(user.name),
      rating,
      content: content.trim(),
    })
    setContent("")
    setError(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-4xl">{reviews.length ? average.toFixed(1) : "-"}</p>
        <p className="text-sm">
          {reviews.length ? <Stars value={Math.round(average)} /> : null} 후기 {reviews.length}개
        </p>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-paper p-6" noValidate>
          <p className="text-sm font-medium">상품은 어떠셨나요?</p>

          <div className="mt-3 flex gap-1" role="radiogroup" aria-label="별점">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n}점`}
                onClick={() => setRating(n)}
                className={`text-2xl leading-none ${n <= rating ? "" : "text-brown/30"}`}
              >
                ★
              </button>
            ))}
          </div>

          <label htmlFor="review-content" className="sr-only">
            후기 내용
          </label>
          <textarea
            id="review-content"
            className="field mt-3 resize-none"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="솔직한 사용 후기를 남겨주세요."
          />
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary mt-3">
            후기 등록
          </button>
        </form>
      ) : (
        <p className="rounded-2xl bg-paper p-6 text-sm">
          후기는 로그인 후 남길 수 있어요.{" "}
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-medium underline underline-offset-4">
            로그인하기
          </Link>
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm">아직 등록된 후기가 없어요. 첫 후기를 남겨주세요.</p>
      ) : (
        <ul className="divide-y divide-brown/20">
          {reviews.map((r) => (
            <li key={r.id} className="py-6 first:pt-0">
              <div className="flex items-center justify-between text-sm">
                <Stars value={r.rating} />
                <span className="text-xs">{r.author}</span>
              </div>
              {r.option && <p className="mt-2 text-xs">옵션: {r.option}</p>}
              <p className="mt-2 text-sm leading-relaxed">{r.content}</p>
              <p className="mt-2 text-xs">{r.createdAt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
