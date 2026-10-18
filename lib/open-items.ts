/**
 * 정식 오픈 전에 꼭 확인·결정해야 하는 항목.
 *
 * - 관리자 대시보드(/admin)에 표시됩니다.
 * - 저장소의 OPEN_ITEMS.md에도 같은 내용이 정리됩니다.
 *   이 파일을 고친 뒤 `npm run open-items`를 실행하면 OPEN_ITEMS.md가 다시 만들어져요.
 * - 결정이 끝난 항목은 done: true 와 decision(확정 내용)을 적어두세요.
 */
export interface OpenItem {
  id: string
  title: string
  detail: string
  /** 다시 확인할 때 따라가면 되는 체크리스트 */
  checklist?: string[]
  /** 참고 자료 */
  links?: { label: string; url: string }[]
  /** 코드에서 임시값을 쓰고 있는 위치 */
  where?: string
  /** 사용자가 직접 확인해 달라고 요청한 항목 */
  requested?: boolean
  done?: boolean
  /** 확정된 내용 (done일 때) */
  decision?: string
}

export const OPEN_ITEMS: OpenItem[] = [
  {
    id: "shipping-fee",
    title: "배송비 정책",
    detail: "지금은 임시로 3,000원, 5만 원 이상 무료예요. 제주·도서산간 추가 배송비 여부도 함께 정해야 해요.",
    checklist: ["기본 배송비 금액", "무료 배송 기준 금액", "제주·도서산간 추가 배송비", "반품·교환 시 배송비 부담"],
    where: "lib/shop.ts",
    requested: true,
  },
  {
    id: "identity-verification",
    title: "회원가입 본인인증",
    detail:
      "필요한지, 필요하다면 어떤 방식(휴대폰 본인인증 등)으로 할지 정해야 해요. 인증 1건당 비용이 드는 서비스가 많아서 단가와 월 예상 건수를 확인해야 해요.",
    checklist: ["본인인증이 꼭 필요한 서비스인지", "방식 선택 (휴대폰 / 간편인증 등)", "서비스별 1건당 단가 (공식 가격 안내·문의로 확인)", "월 예상 가입자 수로 비용 계산"],
    requested: true,
  },
  {
    id: "social-login",
    title: "카카오·네이버 간편 로그인",
    detail:
      "이용료는 공식 요금표로 확인하지 못했어요. 비용보다 심사·사업자 정보 요건이 걸림돌일 수 있어서, 이메일 가입으로 먼저 오픈하고 나중에 추가하는 것을 추천해요.",
    checklist: [
      "카카오: 이용료가 있는지 (공식 요금 안내 확인)",
      "카카오: 이메일·전화번호 등을 받으려면 사업자 정보가 등록된 비즈 앱과 개인정보 동의항목 심사가 필요한지",
      "카카오: 심사 전 테스트 앱은 팀원만 쓸 수 있어서, 오픈 전에 심사를 받아야 하는지",
      "네이버: 이용료와 검수(심사) 절차",
      "Supabase: 카카오는 기본 제공 로그인으로 연결되는지, 네이버는 별도 구현이 필요한지 (공식 문서 확인)",
      "사업자등록 시점과 심사 일정을 맞출 수 있는지",
    ],
    links: [
      { label: "카카오 개발자 포럼: 개인 개발자 비즈 앱", url: "https://devtalk.kakao.com/t/topic/149739" },
      { label: "카카오 개발자 포럼: 로그인 심사 문의", url: "https://devtalk.kakao.com/t/topic/151805" },
      { label: "카카오 개발자 포럼: 사업자 없이 권한 신청", url: "https://devtalk.kakao.com/t/topic/138132" },
    ],
    requested: true,
  },
  {
    id: "password-policy",
    title: "비밀번호·이메일 인증 방식",
    detail:
      "이메일+비밀번호 가입을 기준으로, 아래를 정해야 해요. 가입 인증·비밀번호 찾기 메일은 기본 제공 발송량이 매우 적다는 자료가 많아서(정확한 숫자는 공식 문서 확인 필요), 오픈 전에 별도 메일 발송 서비스 연결이 필요해요.",
    checklist: [
      "로그인 아이디: 이메일로 할지 (추천), 별도 아이디를 둘지",
      "비밀번호 규칙: 지금은 영문+숫자 8자 이상",
      "가입 시 이메일 인증을 받을지 (추천: 받기 — 가짜 이메일 방지)",
      "비밀번호 찾기: 이메일로 재설정 링크 보내기 (추천) / 본인인증으로 찾기",
      "로그인 유지 기간",
      "인증·재설정 메일 발송 서비스 선택 (무료 구간이 있는 서비스 비교)",
    ],
    links: [{ label: "Supabase 요금 안내", url: "https://supabase.com/pricing" }],
    where: "components/auth/SignupForm.tsx, lib/format.ts",
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
  {
    id: "review-timing",
    title: "후기 작성 가능 시점",
    detail: "후기는 구매한 사람만, 주문 1건당 1개 작성할 수 있어요.",
    where: "lib/shop.ts",
    done: true,
    decision: "배송 완료 후에만 작성 가능 (2026-10-19 확정)",
  },
]
