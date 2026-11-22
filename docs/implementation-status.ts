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

export const LAST_UPDATED = "2026-11-22"

/** 지금 상태를 한눈에 */
export const OVERVIEW: { label: string; value: string }[] = [
  { label: "운영 주소", value: "www.ooro.store — 커밍순 페이지만 공개 중이에요. 전체 사이트는 아직 공개 전이에요." },
  { label: "작업 브랜치", value: "dev — 모든 작업이 저장돼 있어요. Vercel '미리보기' 주소에서 전체 사이트를 볼 수 있어요." },
  {
    label: "서버(Supabase)",
    value:
      "프로젝트 'ooro'(서울) 생성·DB 구축·샘플 상품 입력·로그인 주소 설정 완료. 내 컴퓨터(localhost)에서 주문→배송 완료→후기→Q&A→관리자 답변까지 실제 서버로 시험 통과. Vercel 환경 변수도 넣어서 dev 미리보기 주소에서 실제 상품이 보여요.",
  },
  { label: "자동 점검", value: "린트·빌드 통과, DB 보안·규칙 시험 117개 통과 (재고 차감·주문 취소·수정/삭제·상품 순서 규칙은 실제 서버에서도 확인)" },
  { label: "시험용 계정", value: "Supabase에 시험용 회원 2개(구매자·관리자, qa-*@example.com)와 그 주문·후기·Q&A가 있어요. 정식 오픈 전에 지워야 해요." },
  {
    label: "아직 못 해본 시험",
    value:
      "회원가입·메일 인증·비밀번호 재설정·이메일 변경(메일 서비스 연결 필요), 비밀글 사진, 상품 사진 여러 장, 관리자가 주문 상태를 '취소'로 바꾸는 화면 조작(규칙은 확인함)",
  },
]

/** 작업을 이어서 할 때 */
export const RESUME_STEPS: string[] = [
  "작업 폴더: C:\\Users\\송은진\\wellness-commerce-preview (브랜치: dev)",
  "내 컴퓨터에서 보기: 터미널에서 npm run dev → 브라우저에서 http://localhost:3000 (연결 정보는 .env.local, 이 파일은 GitHub에 올라가지 않아요)",
  "점검하기: npm run lint · npm run build · npm run db:test",
  "올리기: dev 브랜치에 push → Vercel > Deployments 에서 dev 항목의 Visit 으로 확인",
  "이 체크리스트 최신화: docs/implementation-status.ts 수정 후 npm run implementation (또는 Claude에게 '체크리스트 갱신해줘')",
]

/** 다음에 할 일 (추천 순서) */
export const NEXT_STEPS: string[] = [
  "메일 서비스(Resend) 확정·연결 — 지금은 Supabase 기본 메일이라 이메일 문구를 못 바꾸고 팀원 주소로만 발송돼요. 연결해야 실제 가입 인증 메일 시험·문구 적용이 가능해요",
  "내 진짜 이메일로 가입해서 관리자로 지정하고, 시험용 회원 2개 삭제",
  "사업자 등록·통신판매업 신고 정보를 lib/business.ts 에 채우고, 이용약관·개인정보처리방침 초안을 법률 전문가에게 검토받기",
  "남은 시험: 회원가입·메일 인증·비밀번호 재설정·이메일 변경 (메일 서비스 연결 뒤), 비밀글 사진, 상품 사진 여러 장",
  "UI 개편 확인 — 미리보기 주소에서 화면을 보고, 마음에 안 드는 부분(색·간격·문구 위치)을 알려주세요",
  "동업자 확인이 필요한 항목 정하기 — 메일 서비스(Resend), 요금제, 결제(PG), 택배사 등 (OPEN_ITEMS.md)",
  "결제(PG) 연동 → 결제 취소·환불 → 주문·배송 알림 메일 → 정식 오픈",
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
        note: "모바일에서는 왼쪽 햄버거 메뉴(ABOUT · SHOP · LOGIN/LOGOUT) + 가운데 로고 + 오른쪽 CART · MY로 바뀌어요. 개편 뒤 주요 화면에서 가로로 삐져나오는 곳이 없는 걸 확인했어요.",
        where: "components/layout/Header.tsx",
      },
      {
        title: "상단 메뉴 (영문 메뉴 이름)",
        status: "done",
        note: "왼쪽 ABOUT · SHOP, 가운데 로고, 오른쪽 LOGIN(로그인하면 LOGOUT) · CART · MY(관리자는 ADMIN 추가)예요. 메뉴 이름은 영어로 통일했고 Q&A 메뉴는 하단 CONTACT '문의하기'로 옮겼어요. MY는 로그아웃 상태에서 누르면 로그인 화면으로 안내돼요. 데스크톱·모바일 모두 확인했어요.",
        where: "components/layout/Header.tsx",
      },
      {
        title: "배경색 흰색 (아이보리 → 흰색)",
        status: "done",
        note: "페이지 배경을 아이보리에서 흰색으로 바꿨어요. 카드·입력칸·안내 상자는 흰 배경에서 구분되도록 아주 연한 웜그레이로, 글자·로고·버튼은 기존 갈색 그대로예요. 색은 app/globals.css 맨 위 3줄만 고치면 바뀌어요.",
        where: "app/globals.css",
      },
      {
        title: "UI 개편 (참고: aeioustore.com, earthstore.kr)",
        status: "done",
        note: "두 사이트에서 '가운데 로고 헤더(왼쪽 메뉴·오른쪽 계정/장바구니)', '글자 탭 카테고리', '큰 사진 + 작은 글 상품 격자(모바일 2열·데스크톱 3열)', '좁은 한 줄 기둥의 소개 페이지'를 가져와 ooro의 3색 안에서 다시 짰어요. 제목 위에 작은 영문 라벨(SHOP·CART 등)을 붙여 화면마다 위계를 맞췄어요. 기능 코드는 건드리지 않고 배치와 스타일만 바꿨어요. 장바구니·주문서·마이페이지 안쪽 모양은 제목만 맞췄고, 더 다듬을 수 있어요.",
        where: "components/layout/Header.tsx, Footer.tsx, products/ProductCard.tsx, app/globals.css",
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
        note: "전체 폭 큰 사진 위에 문구와 버튼('하루의 리듬을 되찾는 시간') → 대표 상품 큰 사진 2개 → SHOP(전체 상품, 한 줄 4개) 순서예요. 브랜드 이야기는 홈에서 빼고 상단 ABOUT 으로만 봐요. 히어로 사진은 임의 이미지(picsum)이고 문구는 샘플이에요. 실제 사진이 오면 바꿔야 해요.",
        where: "app/page.tsx",
      },
      {
        title: "홈 대표 상품 2개 (화면 폭 가득)",
        status: "done",
        note: "홈 상단 바로 아래에 같은 카테고리의 제품 사진 2장을 화면 양끝까지 가득 나란히 보여줘요(모바일은 위아래). 사진 위에 설명 글은 없고, 오른쪽 사진 안쪽 아래에 '제품 보러가기' 버튼(흰 알약 모양)만 있어요. 두 사진과 이 버튼을 누르면 같은 카테고리 화면(오른쪽 상품의 카테고리)으로 이동해 그 카테고리 탭이 선택된 채 열려요. 어떤 상품을 보여줄지는 관리자 > 상품에서 고르고, 비워 두면 순서상 앞쪽의 재고 있는 상품 2개가 나와요. 데스크톱·모바일 화면과 링크 이동을 확인했어요.",
        where: "components/products/FeaturedTile.tsx, app/page.tsx",
      },
      {
        title: "전체 상품 격자 (한 줄 4개) + 상품 카드",
        status: "done",
        note: "홈(SHOP 섹션)과 SHOP 화면에서 한 줄에 4개(태블릿 3개, 모바일 2개)로 보여줘요. 카드는 사진 / 이름·색상 점 / 정가(취소선)·할인율·판매가 순이고, 사진을 누르면 상품 상세로 가요. 품절 상품은 '일시 품절'로 표시돼요.",
        where: "components/products/ProductCard.tsx, components/products/ProductGrid.tsx",
      },
      {
        title: "브랜드 소개 (/about)",
        status: "temp",
        note: "좁은 한 줄 기둥에 제목 → 큰 사진 → 편지 같은 글 → 사진 → 가치 3가지(01·02·03) 순서예요. 사진과 문구는 샘플이에요.",
        where: "app/about/page.tsx",
      },
      {
        title: "푸터(하단)",
        status: "temp",
        note: "로고·소개 문구, CONTACT(문의하기 → Q&A) · SNS(인스타그램 → instagram.com/official_ooro) 열, 이용약관·개인정보처리방침 링크, 사업자 정보 자리가 있어요(하단의 SHOP 열은 뺐어요). 사업자 정보 값은 아직 비어 있어서 '준비 중'으로 보여요.",
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
        status: "done",
        note: "서버에서 '판매 중'인 상품만 읽어와요(실제 서버에서 6개 표시 확인). 30초마다 새로 가져와서, 관리자가 바꾼 내용이 곧 반영돼요. 카테고리 탭을 누르면 주소(?category=...)에 담겨서 링크로 공유할 수 있고, 홈의 대표 상품에서도 이 주소로 바로 와요(확인 완료).",
        where: "app/products/page.tsx, lib/db/public.ts",
      },
      {
        title: "상품 상세 (사진 갤러리·성분·탭)",
        status: "done",
        note: "큰 사진/작은 사진 전환, 핵심 성분 박스, '상세 정보 · 사용 방법 · 후기 · Q&A' 4개 탭으로 구성했어요. 실제 서버 데이터로 탭 전환·후기·Q&A까지 확인했어요.",
        where: "components/products/ProductDetailView.tsx",
      },
      {
        title: "색상·사이즈 선택",
        status: "done",
        note: "옵션이 있는 상품에서만 선택칸이 나와요. 고르지 않고 담으려 하면 안내 문구가 떠요. 실제 서버 상품에서 차콜(+10,000원)·M·수량 2개를 골라 담아 확인했어요.",
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
        note: "고객용 데이터에는 재고 숫자 칸이 아예 없고 '품절 여부'만 내려가요. 실제 서버에서 로그인 없이 재고 표를 읽으려 하면 거부되는 것과, 품절 상품에 '일시 품절'이 뜨는 것을 확인했어요.",
        where: "products_public 뷰 (0001_init.sql)",
      },
      {
        title: "찜(하트)",
        status: "done",
        note: "하트를 누르면 마이페이지 '찜 목록'에 저장돼요. 로그인 전이면 로그인 화면으로 보내요. 실제 서버에서 찜 추가 → 목록 표시 → 해제까지 확인했어요.",
        where: "components/products/HeartButton.tsx",
      },
      {
        title: "상품 검색·정렬",
        status: "done",
        note: "전체 상품 화면에서 이름·설명으로 검색하고, 낮은 가격순·높은 가격순·이름순으로 정렬할 수 있어요. 카테고리 필터와 함께 써요. 브라우저에서 검색·정렬 결과를 확인했어요.",
        where: "components/products/ProductGrid.tsx",
      },
    ],
  },
  {
    id: "orders",
    title: "장바구니·주문",
    items: [
      {
        title: "장바구니",
        status: "done",
        note: "같은 상품도 색상·사이즈가 다르면 따로 담겨요. 이 브라우저에만 저장돼서 다른 기기에서는 안 보이고, 로그인 없이도 담을 수 있어요. 실제 서버 연결 후 담기·수량·옵션 표시·합계·무료배송 표시를 확인했어요(삭제 버튼은 이번엔 안 눌러봤어요).",
        where: "lib/store/cart.ts, app/cart/page.tsx",
      },
      {
        title: "배송비 계산·설정",
        status: "done",
        note: "기준(지금은 3,000원, 5만 원 이상 무료)은 DB에 저장돼 있어서 관리자 대시보드에서 바로 바꿀 수 있어요. 장바구니 금액은 '예상'이고, 주문할 때 서버가 확정해요. 실제 서버에서 설정을 바꿔 저장하면 장바구니·주문서·'N원 더 담으면 무료' 안내에 바로 반영되는 것과, 32,000원 주문에 배송비 3,000원이 붙는 것을 확인했어요.",
        where: "shop_settings 표, 관리자 대시보드",
      },
      {
        title: "바로 구매",
        status: "done",
        note: "상품 페이지에서 장바구니를 거치지 않고 바로 주문서로 가요. 주문서에는 그 상품만 나오는 것을 확인했어요.",
        where: "lib/store/checkout.ts",
      },
      {
        title: "주문서 (배송지 선택·추가·메모)",
        status: "done",
        note: "기본 배송지가 자동으로 선택돼요. 로그인이 필요하고, 배송지가 없으면 그 자리에서 추가할 수 있어요. 실제 서버에서 배송지를 직접 입력해 저장하면 '기본'으로 지정되는 것까지 확인했어요. 카카오 주소 검색 팝업은 아직 못 눌러봤어요.",
        where: "components/checkout/CheckoutView.tsx",
      },
      {
        title: "주문 만들기 (서버 계산)",
        status: "done",
        note: "브라우저가 보낸 가격은 무시하고, 서버 함수(place_order)가 상품 가격·옵션·재고·배송비를 다시 계산해요. DB 시험을 통과했고, 실제 서버에서 276,000원 주문이 만들어져 화면 예상 금액과 서버 확정 금액이 같은 것도 확인했어요.",
        where: "place_order 함수 (0001_init.sql), lib/queries/account.ts",
      },
      {
        title: "주문 내역 (마이페이지)",
        status: "done",
        note: "내 주문만 최신순으로 보여줘요. 상품·옵션·수량·받는 분·배송 메모·금액·상태가 나오는 것을 실제 서버 주문으로 확인했어요.",
        where: "components/mypage/OrderHistory.tsx",
      },
      {
        title: "결제",
        status: "todo",
        note: "아직 없어요. 지금 '주문하기'는 결제 없이 '주문 접수' 상태의 테스트 주문만 만들어요. 실제 결제는 PG사 가입이 필요해요.",
      },
      {
        title: "재고 차감",
        status: "done",
        note: "주문이 접수되는 즉시 재고가 주문 수량만큼 줄어요. 재고가 모자라면 주문 전체가 거부되고 다른 상품 재고도 줄지 않아요. 동시에 주문해도 재고가 음수가 되지 않아요. 가상 DB 시험과 실제 서버 시험을 모두 통과했어요(0003). 결제를 붙인 뒤에는 '결제 완료 시 차감'으로 바꿀지 정해야 해요.",
        where: "supabase/migrations/0003_stock_and_order_cancel.sql",
      },
      {
        title: "고객 주문 취소 (재고 복구)",
        status: "done",
        note: "마이페이지에서 '주문 접수' 상태의 주문을 직접 취소할 수 있고, 취소하면 재고가 되돌아와요. 관리자가 '취소'로 바꿔도 되돌아오고, 취소된 주문은 되살릴 수 없어요(관리자 화면에서도 취소된 주문의 상태 선택이 잠겨요). 서버 규칙과 마이페이지의 '주문 취소' 버튼을 실제 서버에서 눌러 확인했어요. 배송 준비중부터는 Q&A로 요청해야 해요.",
        where: "components/mypage/OrderHistory.tsx",
      },
      {
        title: "결제 취소·환불 (PG 연동 뒤)",
        status: "todo",
        note: "결제가 연결되지 않아서 아직 돈이 오가지 않아요. 결제를 붙일 때 취소하면 카드 결제도 함께 취소(환불)되게 만들어야 해요.",
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
        note: "가입하면 인증 메일이 가고, 링크를 눌러야 가입이 끝나요. 가입·비밀번호 재설정·이메일 변경 메일 3종을 우리 디자인으로 만들어 뒀지만, Supabase는 직접 연결한 메일 서버(SMTP)가 있어야만 문구를 바꿀 수 있어서 아직 적용하지 못했어요. 실제 메일이 오는 시험도 메일 서비스 연결 뒤에 해야 해요.",
        where: "app/auth/confirm/route.ts, supabase/email-templates/",
      },
      {
        title: "로그인·로그아웃",
        status: "done",
        note: "로그아웃을 누를 때까지 로그인이 유지돼요(확정). 로그아웃 버튼은 머리글(모바일은 ☰ 메뉴 안)과 마이페이지 > 회원 정보에 있어요. 실제 서버에서 로그인·로그아웃·계정 전환을 여러 번 확인했어요. 인증 전에 로그인하면 나오는 '인증 메일 다시 받기' 버튼은 아직 못 봤어요.",
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
        status: "done",
        note: "4개 탭으로 나뉘어 있고, 로그인하지 않으면 로그인 화면으로 보내요. 4개 탭 모두 실제 서버로 확인했어요. 이름이 비어 있으면 인사말에 이메일 앞부분을 써요.",
        where: "app/mypage/",
      },
      {
        title: "배송지 관리 + 주소 검색",
        status: "done",
        note: "추가·수정·삭제·기본 배송지 지정(기본을 지우면 남은 배송지가 자동으로 기본). 카카오(다음) 주소 검색은 무료이고 키가 필요 없어요. 실제 서버에서 검색 → 선택 → 우편번호·주소 자동 입력 → 저장까지 확인했어요. 시험 중 카카오가 옛 주소(t1.daumcdn.net)를 2026-11-30에 종료한다고 안내해서 새 주소(t1.kakaocdn.net)로 바꿨어요.",
        where: "components/mypage/AddressForm.tsx, lib/postcode.ts",
      },
      {
        title: "회원정보 변경",
        status: "test",
        note: "이름·휴대폰·수신 동의 수정, 이메일 변경(새 주소로 확인 메일), 비밀번호 변경(현재 비밀번호를 먼저 확인)을 할 수 있어요. 실제 서버에서 이름·휴대폰 저장, 틀린 현재 비밀번호 거부, 비밀번호 변경 성공을 확인했어요. 이메일 변경은 확인 메일이 필요해서 메일 서비스 연결 뒤에 시험해야 해요.",
        where: "components/mypage/ProfileForm.tsx",
      },
      {
        title: "회원 탈퇴",
        status: "done",
        note: "로그인 정보·배송지·찜은 지우고, 주문 기록은 남겨요(회원과의 연결만 끊김). 실제 서버에서 시험 계정으로 주문 후 탈퇴해, 계정과 배송지가 지워지고 주문은 회원 연결만 끊긴 채 남는 것을 확인했어요. 기록을 얼마나 보관할지는 확인 목록에 있어요.",
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
        status: "done",
        note: "내 주문이 '배송 완료'일 때만, 주문 1건당 후기 1개, 사진은 최대 3장이에요. 화면과 DB 양쪽에서 막아요. 실제 서버에서 배송 완료 후 별점·글·사진 1장으로 등록하고 '이미 후기를 남기셨어요'가 뜨는 것까지 확인했어요.",
        where: "components/products/ReviewSection.tsx",
      },
      {
        title: "후기 목록·평균 별점",
        status: "done",
        note: "작성자 이름은 가운데를 별표로 가려서(홍*동) 보여줘요. 관리자가 숨긴 후기는 고객에게 안 보여요. 실제 서버에서 평균 5.0과 후기 목록 표시는 확인했고, 시험 계정은 이름이 비어 있어 이름 가림은 이름 있는 계정으로 한 번 더 봐야 해요.",
        where: "lib/queries/community.ts",
      },
      {
        title: "Q&A (상품별 탭 + 전체 게시판)",
        status: "test",
        note: "상품 페이지의 Q&A 탭과 /qna 게시판이 같은 데이터를 써요. 상품과 무관한 일반 문의도 가능하고, 사진은 최대 3장이에요. 실제 서버에서 상품 페이지 질문 등록, /qna 게시판의 전체 문의·필터, 사진 첨부 일반 문의(작성자 본인 화면에서 사진 표시)까지 확인했어요. 로그인 안 한 방문자에게 공개 문의 사진이 안 보이는 문제를 찾아서 고쳤고(아래 '방문자에게 공개 문의 사진 보이기'), 서버 적용만 남았어요.",
        where: "components/qna/, app/qna/page.tsx",
      },
      {
        title: "비밀글",
        status: "done",
        note: "작성자와 관리자만 내용을 볼 수 있고, 다른 사람에게는 '비밀글입니다.'만 보여요(답변도 가려요). 첨부 사진도 같은 규칙(비공개 저장소 + 1시간짜리 임시 주소)이에요. 실제 서버에 비밀글을 쓰고, 로그인 안 한 상태로 읽으면 가려지는 것과 관리자 화면에서는 보이는 것을 확인했어요. 사진 부분은 아직이에요.",
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
        status: "done",
        note: "본인이 쓴 후기의 별점·내용을 고치거나 지울 수 있고, 질문은 답변이 달리기 전까지 고칠 수 있고 언제든 지울 수 있어요(답변이 달린 질문은 삭제만 보여요). 글을 지우면 첨부 사진도 정리해요. 남의 글·숨김·답변은 건드릴 수 없는 규칙과, 화면의 수정·삭제 버튼을 실제 서버에서 눌러 확인했어요(0004). 첨부 사진은 수정할 수 없어요.",
        where: "supabase/migrations/0004_edit_delete_own_posts.sql",
      },
    ],
  },
  {
    id: "admin",
    title: "관리자 (/admin)",
    items: [
      {
        title: "관리자 권한",
        status: "done",
        note: "DB의 회원 정보(role)로 정하고, SQL로만 지정할 수 있어요. 관리자가 아니면 화면이 막히고 관리자용 데이터도 서버가 아예 내려주지 않아요. 실제 서버에서 SQL로 관리자를 지정해 관리자 화면에 들어가는 것을 확인했고, 일반 회원 차단은 DB 시험으로 확인했어요.",
        where: "components/admin/AdminShell.tsx, profiles 표",
      },
      {
        title: "대시보드",
        status: "done",
        note: "처리할 주문·답변 대기 Q&A·판매 중 상품·후기 숫자, 최근 주문, 배송비 설정, '오픈 전 확인 목록'이 나와요. 실제 서버 숫자로 표시되는 것과 배송비 저장이 되는 것을 확인했어요.",
        where: "components/admin/Dashboard.tsx",
      },
      {
        title: "상품 등록·수정·숨김·삭제",
        status: "done",
        note: "사진(최대 8장·자동 압축·첫 장이 대표), 색상·사이즈·추가금액, 재고, 판매 상태를 다뤄요. 삭제보다 '숨김'을 권장해요(주문 기록 보존). 실제 서버에서 시험 상품을 등록(사진 1장·색상·사이즈 추가금액)하고, 고객 화면에서 사진·합계(17,500원)를 확인한 뒤 수정·숨김(방문자에게 안 보임)·삭제까지 확인했어요. 사진 여러 장 업로드는 아직 안 해봤어요.",
        where: "components/admin/ProductEditor.tsx",
      },
      {
        title: "상품 노출 순서 바꾸기·홈 대표 상품 고르기 (관리자)",
        status: "test",
        note: "관리자 > 상품 목록의 ▲ ▼ 버튼으로 순서를 옮기면, 그 순서가 홈 '전체 상품'과 전체 상품 화면에 그대로 반영돼요(새 상품은 맨 뒤에 붙어요). 같은 화면에서 홈 대표 상품 2개도 골라요. 서버 규칙(관리자만 가능)은 가상 DB 시험과 실제 서버 적용까지 마쳤어요(0005). 관리자 화면에서 직접 눌러본 시험은 아직이에요.",
        where: "components/admin/AdminProductList.tsx, supabase/migrations/0005_product_order_and_discount.sql",
      },
      {
        title: "할인 정보 (정가 입력)",
        status: "test",
        note: "상품 등록·수정에서 '정가(할인 전 가격)'를 넣으면, 고객 화면에 정가 취소선 · 할인율 · 판매가가 보여요(카드·상세 페이지 모두). 정가는 판매가보다 커야 하고(서버도 확인), 비우면 할인 표시가 사라져요. 결제 금액은 항상 판매가 기준이에요. 관리자 화면에서 직접 입력해본 시험은 아직이에요.",
        where: "components/admin/ProductEditor.tsx, lib/pricing.ts",
      },
      {
        title: "주문 관리",
        status: "done",
        note: "상태별로 걸러 보고, 상태를 바꿔요(주문 접수 → 결제 완료 → 배송 준비중 → 배송중 → 배송 완료 → 취소). 실제 서버에서 다른 회원의 주문을 보고 '배송 완료'로 바꾸자 그 회원이 후기를 쓸 수 있게 되는 것까지 확인했어요.",
        where: "components/admin/AdminOrders.tsx",
      },
      {
        title: "Q&A 답변",
        status: "done",
        note: "답변 대기 목록에서 바로 답변하고 수정할 수 있어요. 실제 서버에서 비밀글을 읽고 답변을 등록해 '답변 대기'가 0으로 줄어드는 것과, 작성자가 자기 비밀글의 답변을 보는 것까지 확인했어요.",
        where: "components/admin/AdminQna.tsx",
      },
      {
        title: "후기 관리",
        status: "done",
        note: "부적절한 후기를 숨기거나 다시 게시할 수 있어요. 실제 서버에서 숨기면 방문자 화면에서 사라지고, 다시 게시하면 돌아오는 것을 확인했어요.",
        where: "components/admin/AdminReviews.tsx",
      },
      {
        title: "회원 목록",
        status: "done",
        note: "관리자 > 회원에서 이름·이메일·전화번호 검색, 가입일, 마케팅 동의, 주문 횟수와 금액(취소 제외)을 볼 수 있어요. 관리자 지정은 보안을 위해 화면이 아니라 SQL로만 해요. 관리자 계정으로 실제 서버에서 목록과 검색을 확인했어요.",
        where: "components/admin/AdminMembers.tsx",
      },
      {
        title: "매출·통계",
        status: "done",
        note: "관리자 > 매출·통계에서 기간(7일·30일·전체)별 주문 금액(취소 제외), 건수, 평균 금액, 일별 막대 그래프, 상태별 건수, 많이 팔린 상품을 봐요. 결제 연동 전이라 '주문 금액' 기준이에요. 관리자 계정으로 실제 서버의 숫자(취소 제외 합계, 상태별 건수, 상품 순위)를 확인했어요.",
        where: "components/admin/AdminStats.tsx",
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
        note: "'누가 무엇을 볼 수 있는지'를 코드가 아니라 DB가 직접 지켜요. 가상 DB에서 117개 시험을 모두 통과했어요(npm run db:test). 시험 중 찾은 버그(공개 질문의 사진이 안 보이던 문제)도 고쳤어요. 마이그레이션 0001~0005가 모두 실제 서버에 적용돼 있어요.",
        where: "supabase/tests/security.test.mjs",
      },
      {
        title: "사진 저장소",
        status: "test",
        note: "공개(상품·후기 사진)와 비공개(Q&A 사진) 2개예요. 올릴 수 있는 사람의 규칙은 시험을 통과했고, 실제 서버에서 후기 사진, 관리자 상품 사진, Q&A 사진(작성자 본인 화면) 업로드·표시를 확인했어요. 비밀글 사진은 아직 안 해봤어요.",
        where: "lib/storage.ts",
      },
      {
        title: "방문자에게 공개 문의 사진 보이기 (0002)",
        status: "done",
        note: "실제 서버 시험에서, 로그인 안 한 방문자에게는 공개 문의의 사진이 안 보이는 문제를 찾아 고쳤어요(0002). DB 시험을 통과했고, 실제 서버에도 적용해서 방문자가 공개 문의 사진을 불러오는 것까지 확인했어요.",
        where: "supabase/migrations/0002_public_question_photos_for_visitors.sql",
      },
      {
        title: "재고 차감·주문 취소·수정/삭제 규칙 (0003, 0004)",
        status: "done",
        note: "주문 시 재고 차감, 취소 시 재고 복구, 취소된 주문 잠금, 본인 후기·질문 수정/삭제 규칙을 DB가 직접 지켜요. 실제 서버에 적용했고, 시험용 계정으로 주문 → 재고 감소 → 취소 → 재고 복구, 재취소·되살리기 거부, 재고 초과 거부, 일반 회원의 후기 숨김·질문 답변 시도 차단을 확인했어요.",
        where: "supabase/migrations/0003_stock_and_order_cancel.sql, 0004_edit_delete_own_posts.sql",
      },
      {
        title: "샘플 상품 데이터",
        status: "done",
        note: "샘플 상품 6개와 배송비 설정이 들어 있어요. SQL 한 번이면 들어가요.",
        where: "supabase/seed.sql",
      },
      {
        title: "Supabase 프로젝트 만들기·DB 구축",
        status: "done",
        note: "프로젝트 'ooro'(서울 리전)를 만들고 DB 설계·샘플 상품을 SQL로 넣었어요. 로그인 설정은 Site URL을 www.ooro.store로 바꾸고 허용 주소(Redirect URL) 4개를 넣었어요. 무료 플랜이라 접속이 없으면 정지돼요(요금제 결정은 확인 목록에 있어요).",
        where: "supabase/README.md",
      },
      {
        title: "사이트에 Supabase 연결",
        status: "done",
        note: "내 컴퓨터(localhost)는 .env.local로, Vercel은 환경 변수 2개(Production·Preview)로 연결했어요. dev 미리보기 주소에서도 실제 서버 상품 6개가 보이는 것을 확인했어요. 운영 주소(main)는 아직 커밍순 페이지만 보여요.",
        where: ".env.local, Vercel > Settings > Environment Variables",
      },
      {
        title: "가입·재설정 메일 발송 서비스",
        status: "todo",
        note: "Resend로 잠정 결정했고, 동업자 확인 뒤 연결해요. 지금은 Supabase 기본 메일이라 (1) 이메일 문구·디자인을 바꿀 수 없고 (2) 프로젝트 팀원 이메일로만 보낼 수 있어요. 그래서 메일 서비스를 연결하기 전에는 일반 고객이 가입할 수 없어요.",
      },
      {
        title: "시험용 회원 정리",
        status: "todo",
        note: "시험하려고 Supabase에 만든 가짜 회원 2명(구매자·관리자)과 그 주문·후기·Q&A가 남아 있어요. 정식 오픈 전에 지워야 해요.",
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
        status: "temp",
        note: "표준 쇼핑몰 문안으로 초안을 만들어 /terms, /privacy 페이지로 열어뒀고, 푸터와 가입 화면에서 링크로 연결돼요(오픈 전에는 '초안' 안내가 보여요). 오픈 전에 사업자 정보를 채우고 법률 전문가에게 검토받아야 해요.",
        where: "app/terms/page.tsx, app/privacy/page.tsx",
      },
      {
        title: "사업자 정보 표시",
        status: "temp",
        note: "푸터와 약관에 상호·대표자·사업자등록번호·통신판매업 신고번호·주소·고객센터가 들어갈 자리를 만들었어요. 값은 아직 비어 있어 '준비 중'으로 보이고, lib/business.ts 의 빈칸만 채우면 돼요.",
        where: "lib/business.ts",
      },
      {
        title: "실제 상품 사진·상품 정보",
        status: "temp",
        note: "지금 상품은 샘플(임의 이미지)이에요. 관리자 > 상품에서 실제 상품으로 바꿔요.",
      },
      {
        title: "검색 노출·공유 미리보기",
        status: "done",
        note: "페이지별 제목·설명, 링크 공유 시 보이는 대표 이미지(상품은 상품 사진), 검색 안내 파일(robots·sitemap)을 만들었어요. 오픈 전(미리보기·커밍순)에는 검색 엔진이 수집하지 못하게 막아두었고, 정식 오픈(LAUNCHED)하면 자동으로 열려요.",
        where: "app/robots.ts, app/sitemap.ts, app/opengraph-image.tsx",
      },
    ],
  },
]
