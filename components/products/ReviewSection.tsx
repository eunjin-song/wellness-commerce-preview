"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import type { Product, Review } from "@/lib/types"
import { useAuthState } from "@/lib/auth"
import { useAddReview, useDeleteReview, useProductReviews, useReviewTarget, useUpdateReview } from "@/lib/queries/community"
import { toKoreanError } from "@/lib/db/errors"
import ImagePicker from "@/components/ui/ImagePicker"
import PhotoStrip from "@/components/ui/PhotoStrip"

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`별점 ${value}점`} className="tracking-tight">
      <span>{"★".repeat(value)}</span>
      <span className="text-brown/25">{"★".repeat(5 - value)}</span>
    </span>
  )
}

/** 후기 한 건. 내 후기라면 고치기·지우기 버튼이 보여요. */
function ReviewItem({ review: r, mine }: { review: Review; mine: boolean }) {
  const update = useUpdateReview()
  const remove = useDeleteReview()
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(r.rating)
  const [content, setContent] = useState(r.content)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) {
      setError("후기 내용을 입력해 주세요.")
      return
    }
    setError(null)
    try {
      await update.mutateAsync({ id: r.id, productId: r.productId, rating, content: content.trim() })
      setEditing(false)
    } catch (err) {
      setError(toKoreanError(err, "후기를 고치지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  async function handleDelete() {
    if (!window.confirm("이 후기를 삭제할까요?\n삭제하면 되돌릴 수 없어요.")) return
    setError(null)
    try {
      await remove.mutateAsync({ id: r.id, productId: r.productId, images: r.images })
    } catch (err) {
      setError(toKoreanError(err, "후기를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  return (
    <li className="py-6 first:pt-0">
      <div className="flex items-center justify-between text-sm">
        <Stars value={editing ? rating : r.rating} />
        <span className="text-xs">{r.author}</span>
      </div>
      {r.option && <p className="mt-2 text-xs">옵션: {r.option}</p>}

      {editing ? (
        <form onSubmit={handleSave} className="mt-3 space-y-3" noValidate>
          <div className="flex gap-1" role="radiogroup" aria-label="별점">
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
          <label htmlFor={`review-edit-${r.id}`} className="sr-only">
            후기 내용
          </label>
          <textarea id={`review-edit-${r.id}`} className="field resize-none" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary px-5 py-2 text-xs" disabled={update.isPending}>
              {update.isPending ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className="btn-outline px-5 py-2 text-xs"
              onClick={() => {
                setEditing(false)
                setRating(r.rating)
                setContent(r.content)
                setError(null)
              }}
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 text-sm leading-relaxed">{r.content}</p>
      )}

      {r.images.length > 0 && <PhotoStrip images={r.images} label="후기 사진" />}

      <div className="mt-2 flex items-center justify-between text-xs">
        <span>{r.createdAt}</span>
        {mine && !editing && (
          <span className="flex gap-3">
            <button type="button" className="underline underline-offset-4" onClick={() => setEditing(true)}>
              수정
            </button>
            <button type="button" className="underline underline-offset-4" disabled={remove.isPending} onClick={handleDelete}>
              삭제
            </button>
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </li>
  )
}

const BLOCKED_MESSAGE = {
  "no-purchase": "이 상품을 구매하신 분만 후기를 남길 수 있어요.",
  "not-delivered": "배송이 완료되면 후기를 남길 수 있어요.",
  already: "이미 후기를 남기셨어요. 소중한 후기 감사합니다.",
} as const

export default function ReviewSection({ product }: { product: Product }) {
  const pathname = usePathname()
  const { authUser } = useAuthState()
  const reviewsQuery = useProductReviews(product.id)
  const reviews = reviewsQuery.data ?? []
  const target = useReviewTarget(product.id)
  const addReview = useAddReview()

  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (target.state !== "ok") return
    if (!content.trim()) {
      setError("후기 내용을 입력해 주세요.")
      return
    }
    setError(null)
    try {
      await addReview.mutateAsync({
        productId: product.id,
        orderId: target.order.id,
        rating,
        content: content.trim(),
        option: target.option,
        images,
      })
      setContent("")
      setImages([])
      setRating(5)
    } catch (err) {
      setError(toKoreanError(err, "후기를 등록하지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-4xl">{reviews.length ? average.toFixed(1) : "-"}</p>
        <p className="text-sm">
          {reviews.length ? <Stars value={Math.round(average)} /> : null} 후기 {reviews.length}개
        </p>
      </div>

      {target.state === "ok" ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-paper p-6" noValidate>
          <div>
            <p className="text-sm font-medium">상품은 어떠셨나요?</p>
            {target.option && <p className="mt-1 text-xs">구매 옵션: {target.option}</p>}
          </div>

          <div className="flex gap-1" role="radiogroup" aria-label="별점">
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

          <div>
            <label htmlFor="review-content" className="sr-only">
              후기 내용
            </label>
            <textarea
              id="review-content"
              className="field resize-none"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="솔직한 사용 후기를 남겨주세요."
            />
          </div>

          <ImagePicker value={images} onChange={setImages} max={3} label="사진" />

          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={addReview.isPending}>
            {addReview.isPending ? "등록 중…" : "후기 등록"}
          </button>
        </form>
      ) : target.state === "loading" ? null : (
        <p className="rounded-2xl bg-paper p-6 text-sm">
          {target.state === "login" ? (
            <>
              후기는 로그인 후 구매하신 분만 남길 수 있어요.{" "}
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-medium underline underline-offset-4">
                로그인하기
              </Link>
            </>
          ) : (
            BLOCKED_MESSAGE[target.state]
          )}
        </p>
      )}

      {reviewsQuery.isPending ? (
        <p className="text-sm">후기를 불러오는 중이에요…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm">아직 등록된 후기가 없어요.</p>
      ) : (
        <ul className="divide-y divide-brown/20">
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} mine={authUser !== null && r.userId === authUser.id} />
          ))}
        </ul>
      )}
    </div>
  )
}
