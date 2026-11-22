import Link from "next/link"
import Logo from "@/components/Logo"

const SHOP_LINKS = [
  { href: "/about", label: "브랜드 이야기" },
  { href: "/products", label: "전체 상품" },
]

const HELP_LINKS = [
  { href: "/qna", label: "Q&A" },
  { href: "/mypage", label: "마이페이지" },
  { href: "/cart", label: "장바구니" },
]

export default function Footer() {
  return (
    <footer className="bg-brown text-cream">
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[2fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo className="h-8 w-auto" />
            <p className="mt-6 max-w-sm leading-relaxed">
              하루 중 가장 조용한 순간을 위한 웰니스 브랜드입니다. 몸과 마음이 잠시 멈춰
              쉴 수 있도록, 정직한 성분과 절제된 만듦새로 제품을 만듭니다.
            </p>
          </div>

          <nav aria-label="둘러보기">
            <p className="eyebrow">Shop</p>
            <ul className="mt-5 space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline-offset-4 hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="고객 지원">
            <p className="eyebrow">Help</p>
            <ul className="mt-5 space-y-3">
              {HELP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline-offset-4 hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-14 border-t border-cream/25 pt-6 text-xs">© 2026 ooro. All rights reserved.</p>
      </div>
    </footer>
  )
}
