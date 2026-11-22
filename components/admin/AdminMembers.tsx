"use client"

import { useMemo, useState } from "react"
import { useAdminMembers, useAdminOrders } from "@/lib/queries/admin"
import { won } from "@/lib/format"

/** 회원 목록: 가입일, 연락처, 마케팅 동의, 주문 횟수·금액(취소 제외) */
export default function AdminMembers() {
  const members = useAdminMembers()
  const orderData = useAdminOrders().data
  const [query, setQuery] = useState("")

  const spending = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    for (const o of orderData ?? []) {
      if (!o.userId || o.status === "취소") continue
      const prev = map.get(o.userId) ?? { count: 0, total: 0 }
      map.set(o.userId, { count: prev.count + 1, total: prev.total + o.amount })
    }
    return map
  }, [orderData])

  const list = members.data ?? []
  const keyword = query.trim().toLowerCase()
  const visible = keyword ? list.filter((m) => `${m.name} ${m.email} ${m.phone}`.toLowerCase().includes(keyword)) : list

  if (members.isPending) return <p className="py-10 text-center text-sm">불러오는 중이에요…</p>
  if (members.isError) return <p className="py-10 text-center text-sm">회원 목록을 불러오지 못했어요.</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          전체 회원 <strong className="tabular-nums">{list.length}</strong>명 · 마케팅 수신 동의{" "}
          <strong className="tabular-nums">{list.filter((m) => m.marketingConsent).length}</strong>명
        </p>
        <div className="w-full sm:w-72">
          <label htmlFor="member-search" className="sr-only">
            회원 검색
          </label>
          <input
            id="member-search"
            type="search"
            className="field py-2.5"
            placeholder="이름·이메일·전화번호 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm">해당하는 회원이 없어요.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-brown/40 text-xs">
                <th scope="col" className="py-2 pr-4 font-medium">
                  이름
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  이메일
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  전화번호
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  가입일
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  마케팅
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-medium">
                  주문
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  주문 금액
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown/15">
              {visible.map((m) => {
                const s = spending.get(m.id)
                return (
                  <tr key={m.id}>
                    <td className="py-3 pr-4">
                      {m.name || "-"}
                      {m.role === "admin" && (
                        <span className="status-pill ml-2" data-tone="solid">
                          관리자
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">{m.email}</td>
                    <td className="py-3 pr-4 tabular-nums">{m.phone || "-"}</td>
                    <td className="py-3 pr-4 tabular-nums">{m.createdAt}</td>
                    <td className="py-3 pr-4">{m.marketingConsent ? "동의" : "-"}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{s?.count ?? 0}건</td>
                    <td className="py-3 text-right tabular-nums">{won(s?.total ?? 0)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs">관리자 지정은 보안을 위해 화면에서 하지 않고, 개발자가 SQL로만 해요. 탈퇴한 회원은 목록에서 사라져요.</p>
    </div>
  )
}
