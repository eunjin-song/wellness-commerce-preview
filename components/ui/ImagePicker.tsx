"use client"

import Image from "next/image"
import { useId, useState } from "react"
import { compressImage } from "@/lib/image"

interface Props {
  value: string[]
  onChange: (images: string[]) => void
  max?: number
  label?: string
  /** 있으면 각 사진에 "대표로" 버튼이 생깁니다 (상품 이미지용) */
  onMakeCover?: (index: number) => void
}

const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024

export default function ImagePicker({ value, onChange, max = 3, label = "사진 첨부", onMakeCover }: Props) {
  const inputId = useId()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return

    setError(null)
    const room = max - value.length
    if (room <= 0) return setError(`사진은 최대 ${max}장까지 올릴 수 있어요.`)

    const picked = files.slice(0, room)
    if (files.length > room) setError(`사진은 최대 ${max}장까지라 ${picked.length}장만 추가했어요.`)

    setBusy(true)
    try {
      const added: string[] = []
      for (const file of picked) {
        if (!file.type.startsWith("image/")) {
          setError("이미지 파일만 올릴 수 있어요.")
          continue
        }
        if (file.size > MAX_ORIGINAL_BYTES) {
          setError(`${file.name}은(는) 15MB를 넘어 올릴 수 없어요.`)
          continue
        }
        added.push(await compressImage(file, max > 3 ? 1200 : 900))
      }
      if (added.length > 0) onChange([...value, ...added])
    } catch {
      setError("사진을 불러오지 못했어요. 다른 파일로 다시 시도해 주세요.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="field-label">
        {label} <span className="font-normal">(최대 {max}장)</span>
      </p>

      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div key={src.slice(-40) + i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-brown/25 bg-brown/10">
            <Image src={src} alt={`첨부 사진 ${i + 1}`} fill unoptimized className="object-cover" sizes="80px" />
            <button
              type="button"
              aria-label={`사진 ${i + 1} 삭제`}
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brown text-xs text-paper"
            >
              ×
            </button>
            {onMakeCover && i !== 0 && (
              <button
                type="button"
                onClick={() => onMakeCover(i)}
                className="absolute inset-x-0 bottom-0 bg-brown/85 py-0.5 text-[10px] text-paper"
              >
                대표로
              </button>
            )}
            {i === 0 && onMakeCover && (
              <span className="absolute inset-x-0 bottom-0 bg-brown/85 py-0.5 text-center text-[10px] text-paper">대표</span>
            )}
          </div>
        ))}

        {value.length < max && (
          <label
            htmlFor={inputId}
            className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brown/40 text-xs transition hover:border-brown has-focus-visible:outline-2 has-focus-visible:outline-brown"
          >
            <span className="text-lg leading-none">{busy ? "…" : "+"}</span>
            <span className="mt-1">{busy ? "처리 중" : "추가"}</span>
          </label>
        )}
      </div>

      <input id={inputId} type="file" accept="image/*" multiple className="sr-only" onChange={handleFiles} disabled={busy} />

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
