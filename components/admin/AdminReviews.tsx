"use client"

import { useApp } from "@/lib/store/app"
import { useAllReviews, useCatalog } from "@/lib/hooks"
import PhotoStrip from "@/components/ui/PhotoStrip"

export default function AdminReviews() {
  const reviews = useAllReviews()
  const catalog = useCatalog()
  const hidden = useApp((s) => s.hiddenReviewIds)
  const toggleReviewHidden = useApp((s) => s.toggleReviewHidden)

  const names = Object.fromEntries(catalog.map((p) => [p.id, p.name]))

  if (reviews.length === 0) return <p className="py-10 text-center text-sm">등록된 후기가 없어요.</p>

  return (
    <ul className="space-y-5">
      {reviews.map((r) => {
        const isHidden = hidden.includes(r.id)
        return (
          <li key={r.id} className="rounded-2xl border border-brown/25 p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs">
                {names[r.productId] ?? "상품"} · {r.author} · {r.createdAt}
                {r.option && ` · ${r.option}`}
              </p>
              <span className="status-pill" data-tone={isHidden ? undefined : "solid"}>
                {isHidden ? "숨김" : "게시중"}
              </span>
            </div>
            <p className="mt-2" aria-label={`별점 ${r.rating}점`}>
              {"★".repeat(r.rating)}
              <span className="text-brown/25">{"★".repeat(5 - r.rating)}</span>
            </p>
            <p className="mt-2 leading-relaxed">{r.content}</p>
            {r.images && r.images.length > 0 && <PhotoStrip images={r.images} label="후기 사진" />}
            <button type="button" className="mt-4 text-xs underline underline-offset-4" onClick={() => toggleReviewHidden(r.id)}>
              {isHidden ? "다시 게시" : "숨기기"}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
