"use client"

import { useState } from "react"
import type { Question } from "@/lib/types"
import { useAnswerQuestion } from "@/lib/queries/admin"
import { useQuestions, useSignedUrls } from "@/lib/queries/community"
import { usePublicProducts } from "@/lib/queries/shop"
import { toKoreanError } from "@/lib/db/errors"
import PhotoStrip from "@/components/ui/PhotoStrip"

function QuestionPhotos({ paths }: { paths: string[] }) {
  const { data } = useSignedUrls(paths)
  if (!data || data.length === 0) return null
  return <PhotoStrip images={data} label="첨부 사진" />
}

function AnswerBox({ question }: { question: Question }) {
  const answer = useAnswerQuestion()
  const [text, setText] = useState(question.answer?.content ?? "")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputId = `answer-${question.id}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return setError("답변 내용을 입력해 주세요.")
    setError(null)
    try {
      await answer.mutateAsync({ id: question.id, answer: text.trim() })
      setSaved(true)
    } catch (err) {
      setError(toKoreanError(err, "답변을 저장하지 못했어요."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
      <label htmlFor={inputId} className="field-label">
        {question.answer ? "답변 수정" : "답변 작성"}
      </label>
      <textarea
        id={inputId}
        className="field resize-none"
        rows={3}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setSaved(false)
        }}
      />
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={answer.isPending}>
          {answer.isPending ? "저장 중…" : question.answer ? "답변 수정" : "답변 등록"}
        </button>
        {saved && (
          <span role="status" className="text-sm font-medium">
            저장했어요.
          </span>
        )}
      </div>
    </form>
  )
}

export default function AdminQna() {
  const query = useQuestions()
  const products = usePublicProducts().data
  const [onlyWaiting, setOnlyWaiting] = useState(true)

  const questions = query.data ?? []
  const names = Object.fromEntries((products ?? []).map((p) => [p.id, p.name]))
  const visible = onlyWaiting ? questions.filter((q) => !q.isAnswered) : questions

  if (query.isPending) return <p className="py-10 text-center text-sm">불러오는 중이에요…</p>

  return (
    <div className="space-y-6">
      <div className="flex gap-2" role="group" aria-label="답변 상태">
        <button type="button" className="chip" aria-pressed={onlyWaiting} onClick={() => setOnlyWaiting(true)}>
          답변 대기 {questions.filter((q) => !q.isAnswered).length}
        </button>
        <button type="button" className="chip" aria-pressed={!onlyWaiting} onClick={() => setOnlyWaiting(false)}>
          전체 {questions.length}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm">답변할 질문이 없어요.</p>
      ) : (
        <ul className="space-y-5">
          {visible.map((q) => (
            <li key={q.id} className="rounded-2xl border border-brown/25 p-5 text-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="status-pill" data-tone={q.isAnswered ? "solid" : undefined}>
                  {q.isAnswered ? "답변완료" : "답변대기"}
                </span>
                <span>{q.productId ? (names[q.productId] ?? "상품") : "일반 문의"}</span>
                <span>
                  · {q.author} · {q.createdAt}
                </span>
                {q.isSecret && <span className="status-pill">비밀글</span>}
              </div>
              <p className="mt-3 font-medium">{q.title}</p>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{q.content}</p>
              {q.images.length > 0 && <QuestionPhotos paths={q.images} />}
              <AnswerBox key={`${q.id}-${q.answer?.createdAt ?? "new"}`} question={q} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
