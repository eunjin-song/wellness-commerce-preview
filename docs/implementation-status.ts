/**
 * 구현 현황 체크리스트 — 이 파일 하나가 원본이에요.
 *
 * 고친 뒤 `npm run implementation` 을 실행하면 IMPLEMENTATION.md 가 다시 만들어져요.
 * (공유용 웹페이지는 Claude에게 "체크리스트 갱신해줘"라고 하면 같은 링크로 새로 올려줘요.)
 *
 * 상태 기준
 *  done  완료      : 만들고 직접 확인까지 했어요 (서버 연결과 무관하거나, DB 시험으로 확인한 것)
 *  test  시험 필요 : 만들었지만, 실제 Supabase 서버에 연결해서는 아직 확인하지 못했어요
 *  temp  임시      : 화면은 있지만 샘플 내용이에요 (실제 사진·문구로 교체 필요)
 *  todo  미구현    : 아직 만들지 않았어요
 */

export type Status = "done" | "test" | "temp" | "todo"

export interface Item {
  title: string
  status: Status
  /** 어떤 방식으로 만들었는지 (너무 자세하지 않게) */
  note: string
  /** 관련 파일·위치 */
  where?: string
}

export interface Group {
  id: string
  title: string
  items: Item[]
}

export const STATUS_LABEL: Record<Status, string> = {
  done: "완료",
  test: "시험 필요",
  temp: "임시",
  todo: "미구현",
}

export const LAST_UPDATED = "2026-11-04"

/** 지금 상태를 한눈에 */
export const OVERVIEW: { label: string; value: string }[] = [
  { label: "운영 주소", value: "www.ooro.store — 커밍순 페이지만 공개 중이에요. 전체 사이트는 아직 공개 전이에요." },
  { label: "작업 브랜치", value: "dev — 모든 작업이 저장돼 있어요. Vercel '미리보기' 주소에서 전체 사이트를 볼 수 있어요." },
  { label: "서버(Supabase)", value: "연결 코드는 완성. 프로젝트 연결은 확인되지 않았어요. (이 컴퓨터에 연결 정보 파일이 없어요)" },
  { label: "자동 점검", value: "린트·빌드 통과, DB 보안 시험 80개 통과" },
]

/** 작업을 이어서 할 때 */
export const RESUME_STEPS: string[] = [
  "작업 폴더: C:\\Users\\송은진\\wellness-commerce-preview (브랜치: dev)",
  "내 컴퓨터에서 보기: 터미널에서 npm run dev → 브라우저에서 http://localhost:3000 (서버 연결 전에는 상품 자리에 안내가 나와요)",
  "점검하기: npm run lint · npm run build · npm run db:test",
  "올리기: dev 브랜치에 push → Vercel > Deployments 에서 dev 항목의 Visit 으로 확인",
  "이 체크리스트 최신화: docs/implementation-status.ts 수정 후 npm run implementation (또는 Claude에게 '체크리스트 갱신해줘')",
]

/** 다음에 할 일 (추천 순서) */
export const NEXT_STEPS: string[] = [
  "Supabase 프로젝트 만들고 사이트에 연결하기 — supabase/README.md 순서대로 (계정 생성은 직접 해야 해요)",
  "연결 후 가입 → 메일 인증 → 상품 → 주문 → 후기 → Q&A → 관리자 흐름을 처음부터 끝까지 시험하기 (Claude가 같이 진행)",
  "동업자 확인이 필요한 항목 정하기 — 메일 서비스(Resend), 배송비 정책 등 (OPEN_ITEMS.md)",
  "홈·브랜드 소개 페이지 디자인 다듬기 — 참고 사이트나 캡처가 있으면 더 정확해요",
  "약관·사업자 정보 → 결제(PG) → 정식 오픈",
]

export const GROUPS: Group[] = [
  {
    id: "design",
    title: "디자인·기본 화면",
    items: [
      {
        title: "ooro. 로고 (헤더·푸터·커밍순)",
        status: "done",
        note: "보내주신 로고를 벡터(SVG)로 바꿔서 넣었어요. 확대해도 깨지지 않고, 배경에 따라 색이 자동으로 바뀌어요.",
        where: "components/Logo.tsx",
      },
      {
        title: "브랜드 3색 팔레트",
        status: "done",
        note: "크림(11-0608 TCX) · 브라운(7531 C) · 화이트, 이 3색만 써요. 팬톤을 화면 색으로 바꾼 값은 근사치라 인쇄물과 조금 다를 수 있어요.",
        where: "app/globals.css",
      },
      {
        title: "반응형·모바일 메뉴",
        status: "done",
        note: "모바일에서는 햄버거 메뉴로 바뀌어요. 주요 18개 화면에서 가로로 삐져나오는 곳이 없는 걸 확인했어요(서버 연결 전 버전 기준).",
        where: "components/layout/Header.tsx",
      },
      {
        title: "404 페이지·탭 아이콘",
        status: "done",
        note: "없는 주소로 들어오면 안내 화면이 나오고, 브라우저 탭 아이콘은 로고의 'o.' 모양이에요.",
        where: "app/not-found.tsx, app/icon.svg",
      },
      {
        title: "커밍순 페이지",
        status: "done",
        note: "운영 주소(www.ooro.store)에서만 커밍순이 보이고, 미리보기와 내 컴퓨터에서는 전체 사이트가 보여요. 오픈할 때는 스위치 한 줄(LAUNCHED)만 바꾸면 돼요.",
        where: "lib/site.ts, components/ComingSoon.tsx",
      },
      {
        title: "홈 화면",
        status: "temp",
        note: "큰 소개 문구 + '이번 주 추천' 상품 3개 구조예요. 사진은 임의 이미지(picsum)이고 문구는 샘플이에요. 디자인 다듬기를 기다리는 중이에요.",
        where: "app/page.tsx",
      },
      {
        title: "브랜드 소개 (/about)",
        status: "temp",
        note: "철학 → 스토리 → 가치 순서의 스크롤 레이아웃이에요. 사진과 문구는 샘플이에요.",
        where: "app/about/page.tsx",
      },
      {
        title: "푸터(하단)",
        status: "temp",
        note: "로고와 소개 문구는 있어요. 사업자 정보·약관 링크가 없고, '목업 데이터로 동작합니다'라는 옛 문구가 아직 남아 있어요.",
        where: "components/layout/Footer.tsx",
      },
    ],
  },
  {
    id: "products",
    title: "상품",
    items: [
      {
        title: "상품 목록 + 카테고리 필터",
        status: "test",
        note: "서버에서 '판매 중'인 상품만 읽어와요. 30초마다 새로 가져와서, 관리자가 바꾼 내용이 곧 반영돼요.",
        where: "app/products/page.tsx, lib/db/public.ts",
      },
      {
        title: "상품 상세 (사진 갤러리·성분·탭)",
        status: "test",
        note: "큰 사진/작은 사진 전환, 핵심 성분 박스, '상세 정보 · 사용 방법 · 후기 · Q&A' 4개 탭으로 구성했어요.",
        where: "components/products/ProductDetailView.tsx",
      },
      {
        title: "색상·사이즈 선택",
        status: "test",
        note: "옵션이 있는 상품에서만 선택칸이 나와요. 고르지 않고 담으려 하면 안내 문구가 떠요.",
        where: "components/products/ProductPurchasePanel.tsx",
      },
      {
        title: "옵션별 추가금액",
        status: "done",
        note: "색상·사이즈마다 추가금액을 정해서 기본 가격에 더해요. 고르면 합계가 바로 바뀌고(서버 연결 전 화면에서 확인), 주문할 때 서버가 다시 계산해요(DB 시험으로 확인).",
        where: "lib/pricing.ts",
      },
      {
        title: "재고 비공개·품절 표시",
        status: "done",
        note: "고객용 데이터에는 재고 숫자 칸이 아예 없고 '품절 여부'만 내려가요(DB 시험으로 확인). 품절 상품의 '일시 품절' 표시와 버튼 꺼짐은 서버 연결 후 한 번 더 봐야 해요.",
        where: "products_public 뷰 (0001_init.sql)",
      },
      {
        title: "찜(하트)",
        status: "test",
        note: "하트를 누르면 마이페이지 '찜 목록'에 저장돼요. 로그인 전이면 로그인 화면으로 보내요.",
        where: "components/products/HeartButton.tsx",
      },
      {
        title: "상품 검색·정렬",
        status: "todo",
        note: "아직 없어요. 지금은 카테고리 필터만 있어요.",
      },
    ],
  },
  {
    id: "orders",
    title: "장바구니·주문",
    items: [
      {
        title: "장바구니",
        status: "test",
        note: "같은 상품도 색상·사이즈가 다르면 따로 담겨요. 이 브라우저에만 저장돼서 다른 기기에서는 안 보이고, 로그인 없이도 담을 수 있어요. 담기·수량·삭제는 서버 연결 전에 확인했고, 이후 배송비를 서버 설정에서 읽도록 바꿔서 다시 확인이 필요해요.",
        where: "lib/store/cart.ts, app/cart/page.tsx",
      },
      {
        title: "배송비 계산·설정",
        status: "test",
        note: "기준(지금은 3,000원, 5만 원 이상 무료)은 DB에 저장돼 있어서 관리자 대시보드에서 바로 바꿀 수 있어요. 장바구니 금액은 '예상'이고, 주문할 때 서버가 확정해요.",
        where: "shop_settings 표, 관리자 대시보드",
      },
      {
        title: "바로 구매",
        status: "test",
        note: "상품 페이지에서 장바구니를 거치지 않고 바로 주문서로 가요. 장바구니는 그대로 둬요.",
        where: "lib/store/checkout.ts",
      },
      {
        title: "주문서 (배송지 선택·추가·메모)",
        status: "test",
        note: "기본 배송지가 자동으로 선택돼요. 로그인이 필요하고, 배송지가 없으면 그 자리에서 추가할 수 있어요.",
        where: "components/checkout/CheckoutView.tsx",
      },
      {
        title: "주문 만들기 (서버 계산)",
        status: "test",
        note: "브라우저가 보낸 가격은 무시하고, 서버 함수(place_order)가 상품 가격·옵션·재고·배송비를 다시 계산해요. 이 함수는 DB 시험을 통과했고, 화면과의 연결은 서버 연결 후 확인이 필요해요.",
        where: "place_order 함수 (0001_init.sql), lib/queries/account.ts",
      },
      {
        title: "주문 내역 (마이페이지)",
        status: "test",
        note: "내 주문만 최신순으로 보여줘요. 상품·옵션·수량·받는 분·금액·상태가 나와요.",
        where: "components/mypage/OrderHistory.tsx",
      },
      {
        title: "결제",
        status: "todo",
        note: "아직 없어요. 지금 '주문하기'는 결제 없이 '주문 접수' 상태의 테스트 주문만 만들어요. 실제 결제는 PG사 가입이 필요해요.",
      },
      {
        title: "재고 차감",
        status: "todo",
        note: "주문할 때 재고가 충분한지 확인만 하고 숫자를 줄이지는 않아요. 결제를 붙일 때 같이 만들어야 해요.",
      },
      {
        title: "고객 주문 취소·환불",
        status: "todo",
        note: "고객이 직접 취소하는 기능은 없어요. 관리자가 주문 상태를 '취소'로 바꾸는 것만 가능해요.",
      },
      {
        title: "배송 조회(택배 추적)",
        status: "todo",
        note: "아직 없어요. 주문 상태(배송중 등)만 표시돼요.",
      },
      {
        title: "주문·배송 알림 메일",
        status: "todo",
        note: "아직 없어요. 메일 발송 서비스가 정해진 뒤에 만들 수 있어요.",
      },
    ],
  },
  {
    id: "members",
    title: "회원",
    items: [
      {
        title: "회원가입",
        status: "test",
        note: "이름·이메일·비밀번호(영문+숫자 8자 이상)·휴대폰(선택)·약관 동의를 받아요. 틀린 칸마다 이유를 알려줘요.",
        where: "components/auth/SignupForm.tsx",
      },
      {
        title: "이메일 인증",
        status: "test",
        note: "가입하면 인증 메일이 가고, 링크를 눌러야 가입이 끝나요. 가입·비밀번호 재설정·이메일 변경 메일 3종을 우리 디자인으로 만들어 뒀어요.",
        where: "app/auth/confirm/route.ts, supabase/email-templates/",
      },
      {
        title: "로그인·로그아웃",
        status: "test",
        note: "로그아웃을 누를 때까지 로그인이 유지돼요(확정). 인증 전에 로그인하면 '인증 메일 다시 받기' 버튼이 나와요.",
        where: "components/auth/LoginForm.tsx, lib/auth.tsx",
      },
      {
        title: "비밀번호 찾기·재설정",
        status: "test",
        note: "이메일로 재설정 링크를 보내요. 가입 여부를 알려주지 않으려고 누가 입력해도 같은 안내 문구를 보여줘요.",
        where: "components/auth/ForgotPasswordForm.tsx",
      },
      {
        title: "마이페이지 (주문 내역·배송지·찜·회원 정보)",
        status: "test",
        note: "4개 탭으로 나뉘어 있고, 로그인하지 않으면 로그인 화면으로 보내요.",
        where: "app/mypage/",
      },
      {
        title: "배송지 관리 + 주소 검색",
        status: "test",
        note: "추가·수정·삭제·기본 배송지 지정. 카카오(다음) 주소 검색은 무료이고 키가 필요 없어요. 검색창이 뜨는 것까지 확인했고, 저장은 서버 연결 후 확인이 필요해요.",
        where: "components/mypage/AddressForm.tsx, lib/postcode.ts",
      },
      {
        title: "회원정보 변경",
        status: "test",
        note: "이름·휴대폰·수신 동의 수정, 이메일 변경(새 주소로 확인 메일), 비밀번호 변경(현재 비밀번호를 먼저 확인)을 할 수 있어요.",
        where: "components/mypage/ProfileForm.tsx",
      },
      {
        title: "회원 탈퇴",
        status: "test",
        note: "로그인 정보·배송지·찜은 지우고, 주문 기록은 남겨요(회원과의 연결만 끊김). 기록을 얼마나 보관할지는 확인이 필요해요.",
        where: "delete_my_account 함수 (0001_init.sql)",
      },
      {
        title: "카카오·네이버 간편 로그인",
        status: "todo",
        note: "아직 없어요. 심사·사업자 정보 요건을 확인한 뒤 결정하려고 '확인 필요 목록'에 넣어뒀어요.",
      },
      {
        title: "본인인증",
        status: "todo",
        note: "아직 없어요. 필요 여부와 비용을 확인한 뒤 결정해요(확인 필요 목록).",
      },
    ],
  },
  {
    id: "community",
    title: "후기·Q&A",
    items: [
      {
        title: "구매 후기 작성",
        status: "test",
        note: "내 주문이 '배송 완료'일 때만, 주문 1건당 후기 1개, 사진은 최대 3장이에요. 화면과 DB 양쪽에서 막고, DB 시험으로 확인했어요.",
        where: "components/products/ReviewSection.tsx",
      },
      {
        title: "후기 목록·평균 별점",
        status: "test",
        note: "작성자 이름은 가운데를 별표로 가려서(홍*동) 보여줘요. 관리자가 숨긴 후기는 고객에게 안 보여요.",
        where: "lib/queries/community.ts",
      },
      {
        title: "Q&A (상품별 탭 + 전체 게시판)",
        status: "test",
        note: "상품 페이지의 Q&A 탭과 /qna 게시판이 같은 데이터를 써요. 상품과 무관한 일반 문의도 가능하고, 사진은 최대 3장이에요.",
        where: "components/qna/, app/qna/page.tsx",
      },
      {
        title: "비밀글",
        status: "test",
        note: "작성자와 관리자만 내용을 볼 수 있고, 다른 사람에게는 '비밀글입니다.'만 보여요. 첨부 사진도 같은 규칙(비공개 저장소 + 1시간짜리 임시 주소)이에요. 규칙은 DB 시험으로 확인했어요.",
        where: "questions_feed 뷰 (0001_init.sql)",
      },
      {
        title: "답변 상태 표시·필터",
        status: "test",
        note: "'답변대기/답변완료' 표시와 상태·상품별 필터가 있어요.",
        where: "components/qna/QnaBoard.tsx",
      },
      {
        title: "1:1 문의 → Q&A로 통합",
        status: "done",
        note: "예전 주소(/support/inquiry)는 Q&A로 자동 이동해요. 따로 만들었던 1:1 문의(비공개 답변)는 Q&A의 비밀글로 대신해요.",
        where: "app/support/inquiry/page.tsx",
      },
      {
        title: "후기·Q&A 수정·삭제",
        status: "todo",
        note: "작성한 뒤 고객이 고치거나 지울 수 없어요. 관리자가 후기를 '숨기기'만 할 수 있어요.",
      },
    ],
  },
  {
    id: "admin",
    title: "관리자 (/admin)",
    items: [
      {
        title: "관리자 권한",
        status: "test",
        note: "DB의 회원 정보(role)로 정하고, SQL로만 지정할 수 있어요. 관리자가 아니면 화면이 막히고 관리자용 데이터도 서버가 아예 내려주지 않아요.",
        where: "components/admin/AdminShell.tsx, profiles 표",
      },
      {
        title: "대시보드",
        status: "test",
        note: "처리할 주문·답변 대기 Q&A·판매 중 상품·후기 숫자, 최근 주문, 배송비 설정, '오픈 전 확인 목록'이 나와요.",
        where: "components/admin/Dashboard.tsx",
      },
      {
        title: "상품 등록·수정·숨김·삭제",
        status: "test",
        note: "사진(최대 8장·자동 압축·첫 장이 대표), 색상·사이즈·추가금액, 재고, 판매 상태를 다뤄요. 삭제보다 '숨김'을 권장해요(주문 기록 보존).",
        where: "components/admin/ProductEditor.tsx",
      },
      {
        title: "주문 관리",
        status: "test",
        note: "상태별로 걸러 보고, 상태를 바꿔요(주문 접수 → 결제 완료 → 배송 준비중 → 배송중 → 배송 완료 → 취소). '배송 완료'로 바꾸면 고객이 후기를 쓸 수 있어요.",
        where: "components/admin/AdminOrders.tsx",
      },
      {
        title: "Q&A 답변",
        status: "test",
        note: "답변 대기 목록에서 바로 답변하고 수정할 수 있어요. 비밀글과 첨부 사진도 볼 수 있어요.",
        where: "components/admin/AdminQna.tsx",
      },
      {
        title: "후기 관리",
        status: "test",
        note: "부적절한 후기를 숨기거나 다시 게시할 수 있어요.",
        where: "components/admin/AdminReviews.tsx",
      },
      {
        title: "회원 목록·관리",
        status: "todo",
        note: "아직 없어요. 지금은 Supabase 화면에서 직접 봐야 해요.",
      },
      {
        title: "매출·통계",
        status: "todo",
        note: "아직 없어요.",
      },
    ],
  },
  {
    id: "backend",
    title: "서버·보안 (Supabase)",
    items: [
      {
        title: "데이터베이스 설계",
        status: "done",
        note: "회원·상품·주문·후기·Q&A·찜·배송지·설정 표와, 고객에게 안전하게 보여주는 '뷰' 2개로 구성했어요.",
        where: "supabase/migrations/0001_init.sql",
      },
      {
        title: "보안 규칙",
        status: "done",
        note: "'누가 무엇을 볼 수 있는지'를 코드가 아니라 DB가 직접 지켜요. 가상 DB에서 80개 시험을 모두 통과했어요(npm run db:test). 시험 중 찾은 버그(공개 질문의 사진이 안 보이던 문제)도 고쳤어요.",
        where: "supabase/tests/security.test.mjs",
      },
      {
        title: "사진 저장소",
        status: "test",
        note: "공개(상품·후기 사진)와 비공개(Q&A 사진) 2개예요. 올릴 수 있는 사람의 규칙은 시험을 통과했고, 실제 업로드는 서버 연결 후 확인이 필요해요.",
        where: "lib/storage.ts",
      },
      {
        title: "샘플 상품 데이터",
        status: "done",
        note: "샘플 상품 6개와 배송비 설정이 들어 있어요. SQL 한 번이면 들어가요.",
        where: "supabase/seed.sql",
      },
      {
        title: "Supabase 프로젝트 만들기·연결",
        status: "todo",
        note: "계정을 직접 만들어야 해서 아직이에요. 이 컴퓨터에는 연결 정보 파일(.env.local)이 없고, Vercel에 넣었는지는 확인하지 못했어요. 순서는 supabase/README.md에 있어요.",
        where: "supabase/README.md",
      },
      {
        title: "가입·재설정 메일 발송 서비스",
        status: "todo",
        note: "Resend로 잠정 결정했고, 동업자 확인 뒤 연결해요. 연결 전에는 인증 메일이 시간당 몇 통만 가요.",
      },
    ],
  },
  {
    id: "ops",
    title: "배포·운영",
    items: [
      {
        title: "GitHub 저장소",
        status: "done",
        note: "eunjin-song/wellness-commerce-preview (공개). main은 운영용, dev는 작업용이에요.",
      },
      {
        title: "Vercel 자동 배포",
        status: "done",
        note: "main에 올리면 운영 주소가, dev에 올리면 미리보기 주소가 자동으로 만들어져요.",
      },
      {
        title: "도메인 www.ooro.store",
        status: "done",
        note: "가비아 DNS를 Vercel에 연결했어요. 지금은 커밍순 페이지만 보여요.",
      },
      {
        title: "확인 필요 목록 (동업자 공유)",
        status: "done",
        note: "정해야 할 항목을 OPEN_ITEMS.md, 관리자 대시보드, 공유 웹페이지 세 곳에서 볼 수 있어요.",
        where: "lib/open-items.ts",
      },
      {
        title: "자동 점검 도구",
        status: "done",
        note: "npm run lint(코드 점검) · npm run build(빌드) · npm run db:test(DB 보안 80개 시험).",
      },
      {
        title: "정식 오픈",
        status: "todo",
        note: "dev를 main에 합치고 LAUNCHED를 true로 바꾸면 전체 공개돼요. 그 전에 서버 연결·전체 시험·약관이 먼저예요.",
        where: "lib/site.ts",
      },
    ],
  },
  {
    id: "legal",
    title: "법무·콘텐츠·검색 노출",
    items: [
      {
        title: "이용약관·개인정보처리방침",
        status: "todo",
        note: "가입 화면에 동의 체크칸은 있는데, 읽을 수 있는 문서 페이지가 아직 없어요. 실제 문구가 필요해요.",
      },
      {
        title: "사업자 정보 표시",
        status: "todo",
        note: "푸터에 상호·대표자·사업자등록번호·통신판매업 신고번호 등을 넣어야 해요.",
      },
      {
        title: "실제 상품 사진·상품 정보",
        status: "temp",
        note: "지금 상품은 샘플(임의 이미지)이에요. 관리자 > 상품에서 실제 상품으로 바꿔요.",
      },
      {
        title: "검색 노출·공유 미리보기",
        status: "todo",
        note: "기본 제목·설명만 있어요. 검색 안내 파일(sitemap 등)과 링크 공유 시 보일 대표 이미지는 아직 없어요.",
      },
    ],
  },
]
