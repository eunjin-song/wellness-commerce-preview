"use client"

import { useState } from "react"
import type { Question } from "@/lib/types"
import { useSignedUrls } from "@/lib/queries/community"
import PhotoStrip from "@/components/ui/PhotoStrip"

interface Props {
  questions: Question[]
  loading?: boolean
  /** 상품 이름을 보여주고 싶을 때 (id → 이름) */
  productNames?: Record<string, string>
}

/** 비공개 저장소의 사진은 열릴 때만 임시 주소를 받아서 보여줍니다. */
function QuestionPhotos({ paths }: { paths: string[] }) {
  const { data } = useSignedUrls(paths)
  if (!data || data.length === 0) return null
  return <PhotoStrip images={data} label="첨부 사진" />
}

export default function QnaList({ questions, loading, productNames }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (loading) return <p className="py-10 text-center text-sm">불러오는 중이에요…</p>
  if (questions.length === 0) return <p className="py-10 text-center text-sm">등록된 Q&A가 없어요.</p>

  return (
    <ul className="divide-y divide-brown/20 border-y border-brown/20">
      {questions.map((q) => {
        const open = openId === q.id
        const panelId = `qna-panel-${q.id}`

        return (
          <li key={q.id}>
            <button
              type="button"
              className="flex w-full items-start gap-4 py-4 text-left"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : q.id)}
            >
              <span className="status-pill mt-0.5 shrink-0" data-tone={q.isAnswered ? "solid" : undefined}>
                {q.isAnswered ? "답변완료" : "답변대기"}
              </span>
              <span className="min-w-0 flex-1">
                {productNames && (
                  <span className="mb-0.5 block text-xs">
                    {q.productId ? (productNames[q.productId] ?? "상품") : "일반 문의"}
                  </span>
                )}
                <span className="block text-sm font-medium">
                  {q.isSecret && (
                    <svg viewBox="0 0 24 24" className="mr-1 inline h-3.5 w-3.5 align-[-1px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="비밀글">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  )}
                  {q.title}
                </span>
                <span className="mt-1 block text-xs">
                  {q.author} · {q.createdAt}
                </span>
              </span>
            </button>

            {open && (
              <div id={panelId} className="space-y-4 pb-6 pl-0 text-sm sm:pl-[5.5rem]">
                {q.canView ? (
                  <>
                    <p className="whitespace-pre-line leading-relaxed">{q.content}</p>
                    {q.images.length > 0 && <QuestionPhotos paths={q.images} />}
                    {q.answer ? (
                      <div className="rounded-2xl bg-paper p-5">
                        <p className="text-xs font-medium">ooro. 답변 · {q.answer.createdAt}</p>
                        <p className="mt-2 whitespace-pre-line leading-relaxed">{q.answer.content}</p>
                      </div>
                    ) : (
                      <p className="text-xs">답변을 준비하고 있어요. 영업일 기준 1~2일 안에 남겨드릴게요.</p>
                    )}
                  </>
                ) : (
                  <p>작성자만 볼 수 있는 비밀글이에요.</p>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
