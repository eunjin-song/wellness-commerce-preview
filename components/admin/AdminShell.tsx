"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRequireUser } from "@/lib/hooks"
import { isAdminEmail } from "@/lib/shop"

const TABS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "상품" },
  { href: "/admin/orders", label: "주문" },
  { href: "/admin/qna", label: "Q&A" },
  { href: "/admin/reviews", label: "후기" },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { hydrated, user } = useRequireUser()

  if (!hydrated || !user) return <main className="mx-auto max-w-5xl px-6 py-16" aria-busy="true" />

  if (!isAdminEmail(user.email)) {
    return (
      <main className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="font-display text-3xl">관리자 전용 페이지예요</h1>
        <p className="mt-3 text-sm">관리자 계정으로 로그인해야 볼 수 있어요.</p>
        <Link href="/" className="btn-primary mt-10">
          홈으로
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl">관리자</h1>
        <p className="text-xs">미리보기 단계라 이 브라우저에 저장된 데이터만 보이고 수정돼요.</p>
      </div>

      <nav aria-label="관리자 메뉴" className="mt-8 flex gap-6 overflow-x-auto overflow-y-hidden border-b border-brown/25 text-sm">
        {TABS.map((tab) => {
          const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href)
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
