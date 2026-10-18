"use client"

import Link from "next/link"
import { useState } from "react"
import { useAdminOrders, useAdminProducts, useAdminReviews, useSetShippingSettings } from "@/lib/queries/admin"
import { useQuestions } from "@/lib/queries/community"
import { useSettings } from "@/lib/queries/shop"
import { toKoreanError } from "@/lib/db/errors"
import { OPEN_ITEMS } from "@/lib/open-items"
import { won } from "@/lib/format"

/** 배송비 설정: 값은 DB에 저장돼서 코드를 고치지 않고 바꿀 수 있어요. */
function ShippingSettings() {
  const settings = useSettings()
  const save = useSetShippingSettings()
  const [fee, setFee] = useState(String(settings.shippingFee))
  const [free, setFree] = useState(String(settings.freeShippingThreshold))
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const feeValue = Number(fee.replace(/,/g, ""))
    const freeValue = Number(free.replace(/,/g, ""))
    if (!Number.isInteger(feeValue) || feeValue < 0 || !Number.isInteger(freeValue) || freeValue < 0) {
      setMessage({ ok: false, text: "금액은 0 이상의 숫자로 입력해 주세요." })
      return
    }
    try {
      await save.mutateAsync({ fee: feeValue, freeThreshold: freeValue })
      setMessage({ ok: true, text: "저장했어요. 바로 적용돼요." })
    } catch (err) {
      setMessage({ ok: false, text: toKoreanError(err, "저장하지 못했어요.") })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-paper p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ship-fee" className="field-label">
            기본 배송비 (원)
          </label>
          <input id="ship-fee" inputMode="numeric" className="field tabular-nums" value={fee} onChange={(e) => setFee(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ship-free" className="field-label">
            이 금액 이상이면 무료 (원)
          </label>
          <input id="ship-free" inputMode="numeric" className="field tabular-nums" value={free} onChange={(e) => setFree(e.target.value)} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={save.isPending}>
          {save.isPending ? "저장 중…" : "배송비 저장"}
        </button>
        {message && (
          <span role={message.ok ? "status" : "alert"} className="text-sm font-medium">
            {message.text}
          </span>
        )}
      </div>
    </form>
  )
}

export default function Dashboard() {
  const orders = useAdminOrders().data ?? []
  const questions = useQuestions().data ?? []
  const catalog = useAdminProducts().data ?? []
  const reviews = useAdminReviews().data ?? []
  const currentSettings = useSettings()

  const newOrders = orders.filter((o) => o.status === "주문 접수" || o.status === "결제 완료").length
  const waitingQna = questions.filter((q) => !q.isAnswered).length
  const activeProducts = catalog.filter((p) => p.isActive).length
  const visibleReviews = reviews.filter((r) => !r.isHidden).length
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

      <section aria-labelledby="shipping-settings">
        <h2 id="shipping-settings" className="mb-4 text-sm font-semibold">
          배송비 설정
        </h2>
        <ShippingSettings key={`${currentSettings.shippingFee}:${currentSettings.freeShippingThreshold}`} />
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
                {item.leaning && <span className="status-pill">잠정 결정</span>}
              </div>
              <p className="mt-2 leading-relaxed">{item.detail}</p>
              {item.leaning && <p className="mt-2 font-medium">{item.leaning}</p>}
              {item.table && (
                <div className="relative mt-4 overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-xs leading-relaxed">
                    <thead>
                      <tr className="border-b border-brown/40">
                        {item.table.headers.map((h) => (
                          <th key={h} scope="col" className="py-2 pr-4 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brown/15">
                      {item.table.rows.map((row) => (
                        <tr key={row[0]} className="align-top">
                          {row.map((c, i) =>
                            i === 0 ? (
                              <th key={i} scope="row" className="py-3 pr-4 font-medium">
                                {c}
                              </th>
                            ) : (
                              <td key={i} className="py-3 pr-4">
                                {c}
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {item.table.note && <p className="mt-3">{item.table.note}</p>}
                </div>
              )}
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
