// 사업자 정보 — 푸터와 이용약관·개인정보처리방침에 자동으로 들어갑니다.
//
// ★ 사업자 등록·통신판매업 신고가 끝나면 아래 빈칸("")만 채우고 push 하세요.
//   (전자상거래법상 쇼핑몰 하단에 표시해야 하는 항목들입니다.)
//   비어 있는 항목은 "준비 중"으로 보입니다.

export const BUSINESS = {
  /** 브랜드(쇼핑몰) 이름 */
  brand: "ooro.",
  /** 상호(법인명 또는 사업자 등록상 이름) 예: 주식회사 오로 */
  company: "",
  /** 대표자 이름 */
  ceo: "",
  /** 사업자등록번호 예: 123-45-67890 */
  businessNumber: "",
  /** 통신판매업 신고번호 예: 2026-서울강남-00000 */
  ecommerceNumber: "",
  /** 사업장 주소 */
  address: "",
  /** 고객센터 전화번호 */
  phone: "",
  /** 고객센터 이메일 */
  email: "",
  /** 인스타그램 주소 (비어 있으면 푸터에 '준비 중'으로 보여요) */
  instagram: "https://www.instagram.com/official_ooro",
  /** 고객센터 운영 시간 */
  hours: "평일 10:00 – 17:00 (점심 12:30 – 13:30, 주말·공휴일 휴무)",
  /** 개인정보 보호책임자 (보통 대표자) */
  privacyOfficer: "",
  /** 개인정보 보호책임자 이메일 */
  privacyEmail: "",
  /** 약관 시행일 */
  effectiveDate: "2026-12-01",
} as const

export const PENDING = "준비 중"

/** 비어 있으면 "준비 중" */
export function shown(value: string): string {
  return value.trim() ? value : PENDING
}
