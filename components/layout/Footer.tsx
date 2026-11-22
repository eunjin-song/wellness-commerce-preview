import Link from "next/link"
import Logo from "@/components/Logo"
import { BUSINESS, shown } from "@/lib/business"

const SHOP_LINKS = [
  { href: "/about", label: "브랜드 이야기" },
  { href: "/products", label: "전체 상품" },
]

export default function Footer() {
  return (
    <footer className="bg-brown text-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-16 text-sm md:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo className="h-8 w-auto" />
            <p className="mt-6 max-w-sm leading-relaxed">
              하루 중 가장 조용한 순간을 위한 웰니스 브랜드입니다. 몸과 마음이 잠시 멈춰
              쉴 수 있도록, 정직한 성분과 절제된 만듦새로 제품을 만듭니다.
            </p>
          </div>

          <nav aria-label="SHOP">
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

          <nav aria-label="CONTACT">
            <p className="eyebrow">Contact</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/qna" className="underline-offset-4 hover:underline">
                  문의하기
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="SNS">
            <p className="eyebrow">SNS</p>
            <ul className="mt-5 space-y-3">
              <li>
                {/* 주소는 lib/business.ts 의 instagram 에 넣으면 링크가 켜져요. 비어 있으면 글자만 보여요. */}
                {BUSINESS.instagram.trim() ? (
                  <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                    인스타그램
                  </a>
                ) : (
                  <span className="opacity-70">인스타그램 (준비 중)</span>
                )}
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 space-y-4 border-t border-cream/25 pt-6 text-xs leading-relaxed">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
            <li>
              <Link href="/terms" className="underline-offset-4 hover:underline">
                이용약관
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="underline-offset-4 hover:underline">
                개인정보처리방침
              </Link>
            </li>
          </ul>

          {/* 전자상거래법상 표시 항목: 값은 lib/business.ts 에서 채웁니다 */}
          <address className="not-italic opacity-80">
            <p>
              상호 {shown(BUSINESS.company)} · 대표 {shown(BUSINESS.ceo)} · 사업자등록번호 {shown(BUSINESS.businessNumber)}
            </p>
            <p>
              통신판매업 신고번호 {shown(BUSINESS.ecommerceNumber)} · 주소 {shown(BUSINESS.address)}
            </p>
            <p>
              고객센터 {shown(BUSINESS.phone)} · {shown(BUSINESS.email)} · {BUSINESS.hours}
            </p>
          </address>

          <p>© 2026 ooro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
