"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

/** 사진 썸네일 목록. 누르면 크게 볼 수 있어요. */
export default function PhotoStrip({ images, label = "사진" }: { images: string[]; label?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (openIndex !== null && !dialog.open) dialog.showModal()
    if (openIndex === null && dialog.open) dialog.close()
  }, [openIndex])

  if (images.length === 0) return null

  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2">
        {images.map((src, i) => (
          <li key={src.slice(-40) + i}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`${label} ${i + 1} 크게 보기`}
              className="relative block h-20 w-20 overflow-hidden rounded-lg bg-brown/10"
            >
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="80px" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`${label} 크게 보기`}
        onClose={() => setOpenIndex(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpenIndex(null)
        }}
        className="m-auto max-h-[90vh] max-w-[min(90vw,640px)] rounded-2xl bg-paper p-3 text-brown backdrop:bg-brown/60"
      >
        {openIndex !== null && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[openIndex]} alt={`${label} ${openIndex + 1}`} className="max-h-[78vh] w-auto rounded-xl object-contain" />
        )}
        <button type="button" onClick={() => setOpenIndex(null)} className="btn-outline mt-3 w-full">
          닫기
        </button>
      </dialog>
    </>
  )
}
