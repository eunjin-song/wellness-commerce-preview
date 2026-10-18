/**
 * 정식 오픈 전에 꼭 확인·결정해야 하는 항목.
 * 관리자 대시보드(/admin)에 그대로 표시됩니다. 처리가 끝나면 항목을 지우거나 done을 true로 바꾸세요.
 */
export interface OpenItem {
  id: string
  title: string
  detail: string
  /** 코드에서 임시값을 쓰고 있는 위치 */
  where?: string
  /** 사용자가 직접 확인해 달라고 요청한 항목 */
  requested?: boolean
  done?: boolean
}

export const OPEN_ITEMS: OpenItem[] = [
  {
    id: "shipping-fee",
    title: "배송비 정책",
    detail: "지금은 임시로 3,000원, 5만 원 이상 무료예요. 제주·도서산간 추가 배송비 여부도 함께 정해야 해요.",
    where: "lib/shop.ts",
    requested: true,
  },
  {
    id: "identity-verification",
    title: "회원가입 본인인증",
    detail:
      "필요한지, 필요하다면 어떤 방식(휴대폰 본인인증 등)으로 할지 정해야 해요. 인증 1건당 비용이 드는 서비스가 많아서 단가와 월 예상 건수를 확인해야 해요.",
    requested: true,
  },
  {
    id: "social-login",
    title: "카카오·네이버 간편 로그인",
    detail:
      "카카오는 이메일 같은 정보를 받으려면 사업자 정보가 등록된 비즈 앱과 심사가 필요해요. 네이버도 검수 절차를 확인해야 해요. 이용료는 공식 요금표로 확인이 필요해요.",
  },
  {
    id: "backend",
    title: "서버(Supabase) 연결",
    detail:
      "지금은 회원·주문·후기·Q&A·상품 수정 내용이 접속한 브라우저에만 저장돼요. 정식 오픈 전에 서버를 연결해야 하고, 무료 플랜은 1주일간 접속이 없으면 프로젝트가 일시 정지돼요.",
  },
  {
    id: "admin-auth",
    title: "관리자 권한 방식",
    detail: "지금은 admin@ooro.store 이메일이면 관리자로 인식하는 임시 방식이에요. 서버 연결 시 계정별 권한으로 교체해야 해요.",
    where: "lib/shop.ts",
  },
  {
    id: "payment",
    title: "결제(PG) 가입",
    detail: "지금은 결제 없는 테스트 주문이에요. 실제 카드 결제를 받으려면 PG 가입과 사업자 정보가 필요해요.",
  },
  {
    id: "review-timing",
    title: "후기 작성 가능 시점",
    detail: "지금은 '배송 완료' 상태의 주문에 대해서만 후기를 쓸 수 있어요. 결제 완료 직후부터 허용할지 정해주세요.",
    where: "lib/shop.ts",
  },
  {
    id: "legal",
    title: "약관·개인정보처리방침·사업자 정보",
    detail: "이용약관과 개인정보처리방침 실제 문구, 하단의 사업자 정보(통신판매업 신고번호 등) 표기가 필요해요.",
  },
  {
    id: "policy-copy",
    title: "교환·환불·배송 안내 문구",
    detail: "상품 페이지와 Q&A에 들어갈 실제 안내 문구가 필요해요.",
  },
  {
    id: "real-content",
    title: "실제 상품 사진·상품 정보",
    detail: "지금 상품은 샘플이고 사진도 임의 이미지예요. 관리자 > 상품에서 실제 상품으로 교체해 주세요.",
  },
]
