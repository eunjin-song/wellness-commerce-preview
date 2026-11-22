"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import Logo from "@/components/Logo"
import { signOut } from "@/lib/db/auth"
import { useCartStore } from "@/lib/store/cart"
import { useIsAdmin, useUser } from "@/lib/hooks"

const NAV = [
  { href: "/about", label: "브랜드 이야기" },
  { href: "/products", label: "전체 상품" },
  { href: "/qna", label: "Q&A" },
]

// 가운데 로고, 왼쪽 메뉴, 오른쪽 계정·장바구니 (모바일은 왼쪽 메뉴 버튼 / 오른쪽 장바구니)
export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const { hydrated, user } = useUser()
  const isAdmin = useIsAdmin()
  const count = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))
  const loggedIn = hydrated && !!user
  const accountHref = loggedIn ? "/mypage" : "/login"
  const accountLabel = loggedIn ? "마이페이지" : "로그인"

  async function handleLogout() {
    setMenuOpen(false)
    await signOut()
    router.push("/")
  }

  const linkClass = (href: string) =>
    `underline-offset-[6px] transition hover:underline ${pathname.startsWith(href) ? "underline" : ""}`

  const cartBadge =
    hydrated && count > 0 ? (
      <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brown px-1 text-xs text-paper">
        {count}
      </span>
    ) : null

  return (
    <header className="sticky top-0 z-30 border-b border-brown/15 bg-cream/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5 md:py-6">
        <div className="flex items-center">
          <button
            type="button"
            className="-ml-2 p-2 md:hidden"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <nav aria-label="주요 메뉴" className="hidden gap-7 text-sm md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/" aria-label="ooro. 홈" className="block text-brown" onClick={() => setMenuOpen(false)}>
          <Logo className="h-7 w-auto md:h-8" aria-hidden="true" role="presentation" />
        </Link>

        <div className="flex items-center justify-end gap-6 text-sm">
          {isAdmin && (
            <Link href="/admin" className={`hidden md:inline ${linkClass("/admin")}`}>
              관리자
            </Link>
          )}
          <Link href={accountHref} className={`hidden md:inline ${linkClass(accountHref)}`}>
            {accountLabel}
          </Link>
          {loggedIn && (
            <button type="button" className="hidden underline-offset-[6px] transition hover:underline md:inline" onClick={handleLogout}>
              로그아웃
            </button>
          )}
          <Link href="/cart" className={linkClass("/cart")}>
            장바구니
            {cartBadge}
          </Link>
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
            <li>
              <Link href={accountHref} className="block py-2.5" onClick={() => setMenuOpen(false)}>
                {accountLabel}
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link href="/admin" className="block py-2.5" onClick={() => setMenuOpen(false)}>
                  관리자
                </Link>
              </li>
            )}
            {loggedIn && (
              <li>
                <button type="button" className="block w-full py-2.5 text-left" onClick={handleLogout}>
                  로그아웃
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  )
}
