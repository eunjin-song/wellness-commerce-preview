import type { ReactNode } from "react"
import { LAUNCHED } from "@/lib/site"

interface Props {
  eyebrow: string
  title: string
  effectiveDate: string
  children: ReactNode
}

/** 이용약관·개인정보처리방침이 함께 쓰는 문서 틀 */
export default function LegalDocument({ eyebrow, title, effectiveDate, children }: Props) {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-14 md:pt-20">
      <header className="border-b border-brown/15 pb-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl">{title}</h1>
        <p className="mt-3 text-xs">시행일 {effectiveDate}</p>
      </header>

      {/* 오픈 전(LAUNCHED=false)에만 보이는 안내 */}
      {!LAUNCHED && (
        <p className="mt-8 rounded-xl bg-paper p-4 text-xs leading-relaxed">
          오픈 전 초안입니다. 표준 쇼핑몰 문안을 바탕으로 작성했고, 정식 오픈 전에 사업자 정보를 채우고 법률 전문가의 검토를 받아야 합니다.
        </p>
      )}

      <div className="mt-10 space-y-10 text-sm leading-relaxed">{children}</div>
    </main>
  )
}

export function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  )
}
