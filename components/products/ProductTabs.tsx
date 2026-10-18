"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import type { Product } from "@/lib/mock/products"
import { useProductReviews, useQuestions, useUser } from "@/lib/hooks"
import ReviewSection from "@/components/products/ReviewSection"
import QnaList from "@/components/qna/QnaList"
import QnaForm from "@/components/qna/QnaForm"

type Tab = "detail" | "usage" | "reviews" | "qna"

export default function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<Tab>("detail")
  const [writing, setWriting] = useState(false)
  const { user } = useUser()
  const pathname = usePathname()
  const reviews = useProductReviews(product)
  const questions = useQuestions(product.id)

  const tabs: { id: Tab; label: string }[] = [
    { id: "detail", label: "상세 정보" },
    { id: "usage", label: "사용 방법" },
    { id: "reviews", label: `후기 ${reviews.length}` },
    { id: "qna", label: `Q&A ${questions.length}` },
  ]

  return (
    <div>
      <div role="tablist" aria-label="상품 정보" className="flex gap-6 overflow-x-auto border-b border-brown/25 sm:gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={`relative shrink-0 pb-4 text-sm ${active === tab.id ? "font-semibold" : ""}`}
          >
            {tab.label}
            {active === tab.id && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-brown" />}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="py-10 text-sm leading-relaxed">
        {active === "detail" && <div className="whitespace-pre-line">{product.description}</div>}
        {active === "usage" && <div className="whitespace-pre-line">{product.usageGuide}</div>}
        {active === "reviews" && <ReviewSection product={product} />}
        {active === "qna" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p>이 상품에 대해 궁금한 점을 남겨주세요.</p>
              {!writing &&
                (user ? (
                  <button type="button" className="btn-outline" onClick={() => setWriting(true)}>
                    질문하기
                  </button>
                ) : (
                  <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-outline">
                    로그인 후 질문하기
                  </Link>
                ))}
            </div>
            {writing && <QnaForm productId={product.id} onDone={() => setWriting(false)} />}
            <QnaList questions={questions} />
          </div>
        )}
      </div>
    </div>
  )
}
