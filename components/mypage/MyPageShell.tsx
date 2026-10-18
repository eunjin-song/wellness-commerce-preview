"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRequireUser } from "@/lib/hooks"

const TABS = [
  { href: "/mypage", label: "주문 내역" },
  { href: "/mypage/addresses", label: "배송지 관리" },
  { href: "/mypage/wishlist", label: "찜 목록" },
  { href: "/mypage/profile", label: "회원 정보" },
]

export default function MyPageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { hydrated, user } = useRequireUser()

  if (!hydrated || !user) return <main className="mx-auto max-w-3xl px-6 py-16" aria-busy="true" />

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">마이페이지</h1>
      <p className="mt-2 text-sm">{user.name}님, 안녕하세요.</p>

      <nav aria-label="마이페이지 메뉴" className="mt-8 flex gap-6 overflow-x-auto overflow-y-hidden border-b border-brown/25 text-sm">
        {TABS.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative shrink-0 pb-3 ${active ? "font-semibold" : ""}`}
            >
              {tab.label}
              {active && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-brown" />}
            </Link>
          )
        })}
      </nav>

      <div className="mt-10">{children}</div>
    </main>
  )
}
