"use client"

import Link from "next/link"
import { useApp } from "@/lib/store/app"
import { useAllReviews, useCatalog, useQuestions } from "@/lib/hooks"
import { OPEN_ITEMS } from "@/lib/open-items"
import { won } from "@/lib/format"

export default function Dashboard() {
  const orders = useApp((s) => s.orders)
  const hiddenReviewIds = useApp((s) => s.hiddenReviewIds)
  const questions = useQuestions()
  const catalog = useCatalog()
  const reviews = useAllReviews()

  const newOrders = orders.filter((o) => o.status === "주문 접수" || o.status === "결제 완료").length
  const waitingQna = questions.filter((q) => !q.answer).length
  const activeProducts = catalog.filter((p) => p.isActive !== false).length
  const visibleReviews = reviews.filter((r) => !hiddenReviewIds.includes(r.id)).length
  const openItems = OPEN_ITEMS.filter((i) => !i.done)

  const stats = [
    { href: "/admin/orders", label: "처리할 주문", value: newOrders, hint: `전체 ${orders.length}건` },
    { href: "/admin/qna", label: "답변 대기 Q&A", value: waitingQna, hint: `전체 ${questions.length}건` },
    { href: "/admin/products", label: "판매 중 상품", value: activeProducts, hint: `전체 ${catalog.length}개` },
    { href: "/admin/reviews", label: "게시된 후기", value: visibleReviews, hint: `전체 ${reviews.length}개` },
  ]

  return (
    <div className="space-y-14">
      <section aria-label="요약">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="block rounded-2xl bg-paper p-5 transition hover:ring-1 hover:ring-brown">
                <p className="text-xs">{s.label}</p>
                <p className="mt-2 font-display text-4xl tabular-nums">{s.value}</p>
                <p className="mt-1 text-xs">{s.hint}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-orders">
        <h2 id="recent-orders" className="text-sm font-semibold">
          최근 주문
        </h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm">아직 주문이 없어요.</p>
        ) : (
          <ul className="mt-4 divide-y divide-brown/20 border-y border-brown/20 text-sm">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  {o.id} · {o.recipient}
                </span>
                <span className="flex items-center gap-3">
                  <span className="status-pill">{o.status}</span>
                  <span className="tabular-nums">{won(o.amount)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="open-items">
        <h2 id="open-items" className="text-sm font-semibold">
          정식 오픈 전에 꼭 확인할 항목 ({openItems.length})
        </h2>
        <p className="mt-1 text-xs">정해지면 알려주세요. 코드의 임시값을 실제 값으로 바꿀게요.</p>
        <ul className="mt-4 space-y-3">
          {openItems.map((item) => (
            <li key={item.id} className="rounded-2xl border border-brown/25 p-5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.title}</p>
                {item.requested && (
                  <span className="status-pill" data-tone="solid">
                    요청하신 항목
                  </span>
                )}
              </div>
              <p className="mt-2 leading-relaxed">{item.detail}</p>
              {item.checklist && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed">
                  {item.checklist.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
              {item.links && (
                <ul className="mt-3 space-y-1 text-xs">
                  {item.links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {item.where && <p className="mt-2 text-xs">임시값 위치: {item.where}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
