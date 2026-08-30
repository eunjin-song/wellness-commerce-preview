"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useCartStore } from "@/lib/store/cart"

const NAV = [
  { href: "/about", label: "브랜드 이야기" },
  { href: "/products", label: "전체 상품" },
  { href: "/support/inquiry", label: "1:1 문의" },
]

export default function Header() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const count = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))

  return (
    <header className="sticky top-0 z-30 border-b border-sage-200/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-logo text-3xl leading-none text-brand">
          ooro.
        </Link>

        <nav className="hidden gap-8 text-sm text-ink/60 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/cart" className="relative text-sm text-ink/70 transition hover:text-ink">
          장바구니
          {mounted && count > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sage-400 text-xs text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
