"use client"

import { useState } from "react"
import Image from "next/image"

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-brown/10">
        <Image
          key={images[active]}
          src={images[active]}
          alt={alt}
          fill
          priority
          className="object-cover transition-opacity duration-500 ease-gentle"
          sizes="(min-width: 768px) 45vw, 92vw"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`이미지 ${i + 1} 보기`}
              className={`relative h-20 w-20 overflow-hidden rounded-xl transition
                ${i === active ? "ring-2 ring-brown" : "opacity-60 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
