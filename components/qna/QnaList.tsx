"use client"

import { useState } from "react"
import type { Question } from "@/lib/types"
import { useDeleteQuestion, useSignedUrls, useUpdateQuestion } from "@/lib/queries/community"
import { toKoreanError } from "@/lib/db/errors"
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

/** 내 질문의 수정·삭제. 답변이 달린 뒤에는 수정할 수 없고 삭제만 가능해요. */
function MyQuestionActions({ question: q, onDeleted }: { question: Question; onDeleted: () => void }) {
  const update = useUpdateQuestion()
  const remove = useDeleteQuestion()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(q.title)
  const [content, setContent] = useState(q.content)
  const [isSecret, setIsSecret] = useState(q.isSecret)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해 주세요.")
      return
    }
    setError(null)
    try {
      await update.mutateAsync({ id: q.id, title: title.trim(), content: content.trim(), isSecret })
      setEditing(false)
    } catch (err) {
      setError(toKoreanError(err, "질문을 고치지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  async function handleDelete() {
    if (!window.confirm("이 질문을 삭제할까요?\n삭제하면 되돌릴 수 없어요.")) return
    setError(null)
    try {
      await remove.mutateAsync({ id: q.id, images: q.images })
      onDeleted()
    } catch (err) {
      setError(toKoreanError(err, "질문을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-3 rounded-2xl bg-paper p-5" noValidate>
        <div>
          <label htmlFor={`q-title-${q.id}`} className="field-label">
            제목
          </label>
          <input id={`q-title-${q.id}`} className="field" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`q-content-${q.id}`} className="field-label">
            내용
          </label>
          <textarea id={`q-content-${q.id}`} className="field resize-none" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} className="h-4 w-4 accent-brown" />
          비밀글
        </label>
        <p className="text-xs">첨부 사진은 고칠 수 없어요. 사진을 바꾸려면 삭제 후 다시 등록해 주세요.</p>
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2 text-xs" disabled={update.isPending}>
            {update.isPending ? "저장 중…" : "저장"}
          </button>
          <button
            type="button"
            className="btn-outline px-5 py-2 text-xs"
            onClick={() => {
              setEditing(false)
              setTitle(q.title)
              setContent(q.content)
              setIsSecret(q.isSecret)
              setError(null)
            }}
          >
            취소
          </button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <div className="flex gap-3 text-xs">
        {!q.isAnswered && (
          <button type="button" className="underline underline-offset-4" onClick={() => setEditing(true)}>
            수정
          </button>
        )}
        <button type="button" className="underline underline-offset-4" disabled={remove.isPending} onClick={handleDelete}>
          삭제
        </button>
      </div>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  )
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
                    {q.isMine && <MyQuestionActions question={q} onDeleted={() => setOpenId(null)} />}
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
