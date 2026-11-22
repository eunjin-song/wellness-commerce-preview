"use client"

import { useMemo, useState } from "react"
import { useAdminOrders } from "@/lib/queries/admin"
import { ORDER_STATUSES } from "@/lib/shop"
import { won } from "@/lib/format"

type Range = 7 | 30 | 0 // 0 = 전체

const RANGES: { value: Range; label: string }[] = [
  { value: 7, label: "최근 7일" },
  { value: 30, label: "최근 30일" },
  { value: 0, label: "전체" },
]

const kstToday = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })

/** YYYY-MM-DD 에서 n일 전 날짜 */
function daysAgo(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

/** 매출·통계: 금액은 '취소'를 뺀 주문 기준이에요. (결제 연동 전이라 결제 완료 여부와는 무관) */
export default function AdminStats() {
  const query = useAdminOrders()
  const [range, setRange] = useState<Range>(30)

  const stats = useMemo(() => {
    const orders = query.data ?? []
    const today = kstToday()
    const from = range === 0 ? "0000-00-00" : daysAgo(today, range - 1)
    const inRange = orders.filter((o) => o.createdAt >= from)
    const valid = inRange.filter((o) => o.status !== "취소")

    const revenue = valid.reduce((sum, o) => sum + o.amount, 0)
    const byStatus = ORDER_STATUSES.map((s) => ({ status: s, count: inRange.filter((o) => o.status === s).length }))

    // 상품별 판매 (취소 제외)
    const productMap = new Map<string, { name: string; qty: number; total: number }>()
    for (const o of valid) {
      for (const item of o.items) {
        const key = item.productId ?? item.name
        const prev = productMap.get(key) ?? { name: item.name, qty: 0, total: 0 }
        productMap.set(key, { name: prev.name, qty: prev.qty + item.quantity, total: prev.total + item.price * item.quantity })
      }
    }
    const topProducts = [...productMap.values()].sort((a, b) => b.total - a.total).slice(0, 5)

    // 일별 매출 (최근 14일까지만 막대로 보여줘요)
    const days = Math.min(range === 0 ? 14 : range, 14)
    const daily = Array.from({ length: days }, (_, i) => {
      const date = daysAgo(today, days - 1 - i)
      const total = valid.filter((o) => o.createdAt === date).reduce((sum, o) => sum + o.amount, 0)
      return { date, total }
    })
    const maxDaily = Math.max(...daily.map((d) => d.total), 1)

    return { orderCount: inRange.length, validCount: valid.length, revenue, byStatus, topProducts, daily, maxDaily }
  }, [query.data, range])

  if (query.isPending) return <p className="py-10 text-center text-sm">불러오는 중이에요…</p>
  if (query.isError) return <p className="py-10 text-center text-sm">통계를 불러오지 못했어요.</p>

  const average = stats.validCount ? Math.round(stats.revenue / stats.validCount) : 0

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-2" role="group" aria-label="기간">
        {RANGES.map((r) => (
          <button key={r.value} type="button" className="chip" aria-pressed={range === r.value} onClick={() => setRange(r.value)}>
            {r.label}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "주문 금액 (취소 제외)", value: won(stats.revenue) },
          { label: "주문 건수 (취소 제외)", value: `${stats.validCount}건` },
          { label: "평균 주문 금액", value: won(average) },
          { label: "취소된 주문", value: `${stats.orderCount - stats.validCount}건` },
        ].map((s) => (
          <li key={s.label} className="rounded-2xl bg-paper p-5">
            <p className="text-xs">{s.label}</p>
            <p className="mt-2 font-display text-2xl tabular-nums md:text-3xl">{s.value}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="daily-title">
        <h2 id="daily-title" className="text-sm font-semibold">
          일별 주문 금액 (최근 {stats.daily.length}일)
        </h2>
        <ol className="mt-4 flex h-40 items-end gap-1.5 border-b border-brown/30 sm:gap-2">
          {stats.daily.map((d) => (
            <li key={d.date} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${d.date} · ${won(d.total)}`}>
              <div
                className="w-full rounded-t bg-brown/70"
                style={{ height: `${d.total === 0 ? 0 : Math.max(4, (d.total / stats.maxDaily) * 100)}%` }}
                role="img"
                aria-label={`${d.date} ${won(d.total)}`}
              />
            </li>
          ))}
        </ol>
        <div className="mt-2 flex justify-between text-xs tabular-nums">
          <span>{stats.daily[0]?.date.slice(5)}</span>
          <span>{stats.daily[stats.daily.length - 1]?.date.slice(5)}</span>
        </div>
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        <section aria-labelledby="status-title">
          <h2 id="status-title" className="text-sm font-semibold">
            주문 상태별
          </h2>
          <ul className="mt-4 divide-y divide-brown/15 border-y border-brown/20 text-sm">
            {stats.byStatus.map((s) => (
              <li key={s.status} className="flex justify-between py-2.5">
                <span>{s.status}</span>
                <span className="tabular-nums">{s.count}건</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="top-title">
          <h2 id="top-title" className="text-sm font-semibold">
            많이 팔린 상품 (금액 기준 상위 5개)
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="mt-4 text-sm">아직 집계할 주문이 없어요.</p>
          ) : (
            <ol className="mt-4 divide-y divide-brown/15 border-y border-brown/20 text-sm">
              {stats.topProducts.map((p, i) => (
                <li key={p.name} className="flex justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="mr-2 tabular-nums">{i + 1}</span>
                    {p.name}
                    <span className="ml-2 text-xs">{p.qty}개</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{won(p.total)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
