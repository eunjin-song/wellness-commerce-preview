"use client"

import Link from "next/link"
import { useState } from "react"
import { PRODUCTS } from "@/lib/mock/products"
import { useQuestions, useUser } from "@/lib/hooks"
import QnaForm from "@/components/qna/QnaForm"
import QnaList from "@/components/qna/QnaList"

type StatusFilter = "all" | "waiting" | "done"

const PRODUCT_LIST = PRODUCTS.map((p) => ({ id: p.id, name: p.name }))
const PRODUCT_NAMES = Object.fromEntries(PRODUCT_LIST.map((p) => [p.id, p.name]))

export default function QnaBoard() {
  const { user } = useUser()
  const all = useQuestions()
  const [status, setStatus] = useState<StatusFilter>("all")
  const [target, setTarget] = useState<string>("all")
  const [writing, setWriting] = useState(false)

  const filtered = all.filter((q) => {
    if (status === "waiting" && q.answer) return false
    if (status === "done" && !q.answer) return false
    if (target === "general" && q.productId !== null) return false
    if (target !== "all" && target !== "general" && q.productId !== target) return false
    return true
  })

  const statusOptions: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "전체" },
    { id: "waiting", label: "답변대기" },
    { id: "done", label: "답변완료" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="답변 상태">
          {statusOptions.map((o) => (
            <button key={o.id} type="button" className="chip" aria-pressed={status === o.id} onClick={() => setStatus(o.id)}>
              {o.label}
            </button>
          ))}
        </div>

        {!writing &&
          (user ? (
            <button type="button" className="btn-primary" onClick={() => setWriting(true)}>
              질문하기
            </button>
          ) : (
            <Link href="/login?next=%2Fqna" className="btn-primary">
              로그인 후 질문하기
            </Link>
          ))}
      </div>

      {writing && <QnaForm products={PRODUCT_LIST} onDone={() => setWriting(false)} />}

      <div>
        <label htmlFor="qna-filter-target" className="sr-only">
          문의 대상 필터
        </label>
        <select id="qna-filter-target" className="field w-auto" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="all">전체 문의</option>
          <option value="general">일반 문의</option>
          {PRODUCT_LIST.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <QnaList questions={filtered} productNames={PRODUCT_NAMES} />
    </div>
  )
}
