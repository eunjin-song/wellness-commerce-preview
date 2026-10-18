"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Logo from "@/components/Logo"
import { useCartStore } from "@/lib/store/cart"
import { useIsAdmin, useUser } from "@/lib/hooks"

const NAV = [
  { href: "/about", label: "브랜드 이야기" },
  { href: "/products", label: "전체 상품" },
  { href: "/qna", label: "Q&A" },
]

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { hydrated, user } = useUser()
  const isAdmin = useIsAdmin()
  const count = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))

  const linkClass = (href: string) =>
    `transition hover:underline underline-offset-4 ${pathname.startsWith(href) ? "underline" : ""}`

  return (
    <header className="sticky top-0 z-30 border-b border-brown/15 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" aria-label="ooro. 홈" className="block shrink-0 text-brown" onClick={() => setMenuOpen(false)}>
          <Logo className="h-7 w-auto" aria-hidden="true" role="presentation" />
        </Link>

        <nav aria-label="주요 메뉴" className="hidden gap-8 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-sm">
          {isAdmin && (
            <Link href="/admin" className={`hidden md:inline ${linkClass("/admin")}`}>
              관리자
            </Link>
          )}
          <Link
            href={hydrated && user ? "/mypage" : "/login"}
            className={linkClass(hydrated && user ? "/mypage" : "/login")}
          >
            {hydrated && user ? "마이페이지" : "로그인"}
          </Link>
          <Link href="/cart" className={linkClass("/cart")}>
            장바구니
            {hydrated && count > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brown px-1 text-xs text-paper">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="-mr-2 p-2 md:hidden"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="모바일 메뉴" className="border-t border-brown/15 px-6 py-4 md:hidden">
          <ul className="space-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-2.5" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link href="/admin" className="block py-2.5" onClick={() => setMenuOpen(false)}>
                  관리자
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  )
}
