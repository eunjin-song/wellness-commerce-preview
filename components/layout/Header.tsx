"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import Logo from "@/components/Logo"
import { signOut } from "@/lib/db/auth"
import { useCartStore } from "@/lib/store/cart"
import { useIsAdmin, useUser } from "@/lib/hooks"

// 메뉴 이름은 영어로 통일합니다. (Q&A는 하단 CONTACT 로 옮겼어요)
const NAV = [
  { href: "/about", label: "ABOUT" },
  { href: "/products", label: "SHOP" },
]

// 가운데 로고, 왼쪽 메뉴, 오른쪽 계정·장바구니·MY
// 모바일: 왼쪽 ☰ 메뉴(ABOUT · SHOP · LOGIN/LOGOUT · ADMIN), 오른쪽 CART · MY
export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const { hydrated, user } = useUser()
  const isAdmin = useIsAdmin()
  const count = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))
  const loggedIn = hydrated && !!user

  async function handleLogout() {
    setMenuOpen(false)
    await signOut()
    router.push("/")
  }

  const linkClass = (href: string) =>
    `underline-offset-[6px] transition hover:underline ${pathname.startsWith(href) ? "underline" : ""}`

  const cartBadge =
    hydrated && count > 0 ? (
      <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brown px-1 text-[10px] tracking-normal text-paper">
        {count}
      </span>
    ) : null

  return (
    <header className="sticky top-0 z-30 border-b border-brown/15 bg-cream/90 backdrop-blur">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5 md:px-10 md:py-6">
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

          <nav aria-label="주요 메뉴" className="hidden gap-8 text-xs tracking-[0.18em] md:flex">
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

        <div className="flex items-center justify-end gap-5 text-xs tracking-[0.18em] md:gap-7">
          {isAdmin && (
            <Link href="/admin" className={`hidden md:inline ${linkClass("/admin")}`}>
              ADMIN
            </Link>
          )}
          {loggedIn ? (
            <button type="button" className="hidden underline-offset-[6px] transition hover:underline md:inline" onClick={handleLogout}>
              LOGOUT
            </button>
          ) : (
            <Link href="/login" className={`hidden md:inline ${linkClass("/login")}`}>
              LOGIN
            </Link>
          )}
          <Link href="/cart" className={linkClass("/cart")}>
            CART
            {cartBadge}
          </Link>
          {/* 로그아웃 상태에서 누르면 로그인 화면으로 안내돼요 */}
          <Link href="/mypage" className={linkClass("/mypage")}>
            MY
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="모바일 메뉴" className="border-t border-brown/15 px-6 py-4 text-xs tracking-[0.18em] md:hidden">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-3" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link href="/admin" className="block py-3" onClick={() => setMenuOpen(false)}>
                  ADMIN
                </Link>
              </li>
            )}
            <li>
              {loggedIn ? (
                <button type="button" className="block w-full py-3 text-left" onClick={handleLogout}>
                  LOGOUT
                </button>
              ) : (
                <Link href="/login" className="block py-3" onClick={() => setMenuOpen(false)}>
                  LOGIN
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
