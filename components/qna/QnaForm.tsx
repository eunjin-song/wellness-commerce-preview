"use client"

import { useState } from "react"
import { useCreateQuestion } from "@/lib/queries/community"
import { toKoreanError } from "@/lib/db/errors"
import ImagePicker from "@/components/ui/ImagePicker"

interface Props {
  /** 고정된 상품 (상품 상세 페이지에서 사용) */
  productId?: string
  /** 상품 선택 목록 (Q&A 게시판에서 사용). 있으면 "일반 문의"도 고를 수 있어요. */
  products?: { id: string; name: string }[]
  onDone: () => void
}

export default function QnaForm({ productId, products, onDone }: Props) {
  const create = useCreateQuestion()

  const [target, setTarget] = useState<string>(productId ?? "")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSecret, setIsSecret] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해 주세요.")
      return
    }
    setError(null)
    try {
      await create.mutateAsync({
        productId: target || null,
        title: title.trim(),
        content: content.trim(),
        isSecret,
        images,
      })
      onDone()
    } catch (err) {
      setError(toKoreanError(err, "질문을 등록하지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-paper p-6" noValidate>
      {products && (
        <div>
          <label htmlFor="qna-target" className="field-label">
            문의 대상
          </label>
          <select id="qna-target" className="field" value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">일반 문의 (배송·교환·기타)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="qna-title" className="field-label">
          제목
        </label>
        <input
          id="qna-title"
          className="field"
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="궁금한 점을 한 줄로 적어주세요"
        />
      </div>

      <div>
        <label htmlFor="qna-content" className="field-label">
          내용
        </label>
        <textarea
          id="qna-content"
          className="field resize-none"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="자세히 적어주실수록 정확하게 답변드릴 수 있어요."
        />
      </div>

      <ImagePicker value={images} onChange={setImages} max={3} label="사진 첨부" />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isSecret}
          onChange={(e) => setIsSecret(e.target.checked)}
          className="h-4 w-4 accent-brown"
        />
        비밀글로 등록
      </label>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={create.isPending}>
          {create.isPending ? "등록 중…" : "질문 등록"}
        </button>
        <button type="button" onClick={onDone} className="btn-outline">
          취소
        </button>
      </div>
    </form>
  )
}
