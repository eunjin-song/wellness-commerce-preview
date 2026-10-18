"use client"

import { useState } from "react"

const CATEGORIES = ["상품문의", "배송문의", "교환/환불", "기타"] as const
const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function InquiryForm() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("상품문의")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const oversized = selected.find((f) => f.size > MAX_FILE_SIZE)
    if (oversized) {
      setError(`${oversized.name}은(는) 5MB를 초과합니다.`)
      return
    }
    setError(null)
    setFiles(selected.slice(0, MAX_FILES))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해 주세요.")
      return
    }

    setIsSubmitting(true)
    // 미리보기 버전: 실제 Supabase 저장 대신 제출 흐름만 시뮬레이션합니다.
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brown/25 px-6 py-16 text-center">
        <p className="font-display text-2xl text-brown">문의가 접수되었습니다</p>
        <p className="mt-3 text-sm text-brown">영업일 기준 1~2일 이내 답변드릴게요.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-brown">문의 유형</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-2 text-sm transition
                ${
                  category === c
                    ? "border-brown bg-brown text-paper"
                    : "border-brown/25 text-brown hover:border-brown"
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-brown">
          제목
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="문의 제목을 입력해 주세요"
          className="w-full rounded-xl border border-brown/25 px-4 py-3 text-sm outline-none
                     transition focus:border-brown focus:ring-1 focus:ring-brown"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-medium text-brown">
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="문의하실 내용을 자세히 남겨주시면 빠르게 도와드릴게요."
          className="w-full resize-none rounded-xl border border-brown/25 px-4 py-3 text-sm outline-none
                     transition focus:border-brown focus:ring-1 focus:ring-brown"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-brown">
          이미지 첨부 <span className="text-brown">(최대 {MAX_FILES}장, 장당 5MB)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-brown file:mr-4 file:rounded-full file:border-0
                     file:bg-paper file:px-4 file:py-2 file:text-sm file:text-brown
                     hover:file:bg-brown/15"
        />
        {files.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-brown">
            {files.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-brown font-medium">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-brown py-4 text-sm font-medium text-paper
                   transition duration-300 ease-gentle hover:bg-brown/85 disabled:opacity-50"
      >
        {isSubmitting ? "등록 중…" : "문의 등록하기"}
      </button>
    </form>
  )
}
