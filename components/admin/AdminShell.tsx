"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRequireUser } from "@/lib/hooks"

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

  // 화면을 막는 것은 안내용이고, 실제 보호는 DB의 RLS 규칙이 합니다. (관리자가 아니면 데이터가 아예 안 내려와요)
  if (user.role !== "admin") {
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
      <h1 className="font-display text-3xl">관리자</h1>

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
