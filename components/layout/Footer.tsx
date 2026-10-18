import Logo from "@/components/Logo"

export default function Footer() {
  return (
    <footer className="bg-brown text-cream">
      <div className="mx-auto max-w-6xl px-6 py-14 text-sm">
        <Logo className="h-9 w-auto" />
        <p className="mt-5 max-w-md leading-relaxed">
          하루 중 가장 조용한 순간을 위한 웰니스 브랜드입니다. 몸과 마음이 잠시 멈춰
          쉴 수 있도록, 정직한 성분과 절제된 만듦새로 제품을 만듭니다.
        </p>
        <p className="mt-10 border-t border-cream/25 pt-6 text-xs">
          © 2026 ooro. 본 페이지는 설계 미리보기용으로, 목업 데이터로 동작합니다.
        </p>
      </div>
    </footer>
  )
}
