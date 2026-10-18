"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useCartStore } from "@/lib/store/cart"
import Logo from "@/components/Logo"

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
    <header className="sticky top-0 z-30 border-b border-brown/15 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="ooro. 홈" className="block text-brown">
          <Logo className="h-7 w-auto" aria-hidden="true" role="presentation" />
        </Link>

        <nav className="hidden gap-8 text-sm text-brown md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/cart" className="relative text-sm text-brown transition hover:underline">
          장바구니
          {mounted && count > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brown text-xs text-paper">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
