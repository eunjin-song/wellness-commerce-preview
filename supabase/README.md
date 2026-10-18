# Supabase(서버) 연결 가이드

ooro. 쇼핑몰의 회원·상품·주문·후기·Q&A·사진은 **Supabase**에 저장돼요.
아래 순서대로 한 번만 하면 돼요. (계정 만들기와 값 복사는 직접 하셔야 해요.)

> 이 안내서의 모든 비밀번호·키는 **절대 채팅이나 GitHub에 붙여넣지 마세요.**
> 아래에서 복사하는 두 값(URL, Publishable key)만 "공개되어도 되는 값"이에요.

---

## 1단계. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 접속 → **Start your project** → **Continue with GitHub** 로 로그인
2. **New project** 클릭
   - **Name**: `ooro`
   - **Database Password**: **Generate a password** 버튼으로 만들고, 비밀번호 관리자나 메모장에 **따로 저장**해 두세요. (나중에 DB에 직접 접속할 때만 필요해요)
   - **Region**: **Northeast Asia (Seoul)** ← 한국 손님이 가장 빨라요
   - **Plan**: Free
3. **Create new project** → 1~2분 기다리면 준비 완료

## 2단계. 데이터베이스 만들기 (SQL 붙여넣기)

1. 왼쪽 메뉴 **SQL Editor** → **New query**
2. 이 저장소의 `supabase/migrations/0001_init.sql` 파일을 열어 **전체 복사** → 붙여넣기 → **Run**
   - 아래쪽에 `Success. No rows returned` 가 나오면 성공이에요.
3. 다시 **New query** → `supabase/seed.sql` 전체 복사 → 붙여넣기 → **Run**
   - 샘플 상품 6개와 배송비 설정(3,000원 / 5만 원 이상 무료)이 들어가요.

## 3단계. 로그인 설정

왼쪽 메뉴 **Authentication**에서:

1. **Sign In / Providers**(또는 Providers) → **Email**
   - **Confirm email**: **켬** (가입하면 인증 메일을 받아야 로그인돼요 — 확정된 정책)
   - **Minimum password length**: `8`
2. **URL Configuration**
   - **Site URL**: `https://www.ooro.store`
   - **Redirect URLs**에 아래를 **모두** 추가 (이메일 속 링크가 돌아올 수 있는 주소 목록이에요)
     ```
     http://localhost:3000/**
     https://www.ooro.store/**
     https://ooro.store/**
     https://*-eunjin-song.vercel.app/**
     ```
3. **Emails**(Email Templates)에서 템플릿 3개를 바꿔요. 각 파일의 안내대로 제목과 본문을 붙여넣으세요.
   - `supabase/email-templates/confirm-signup.html` → **Confirm sign up**
   - `supabase/email-templates/reset-password.html` → **Reset password**
   - `supabase/email-templates/change-email.html` → **Change email address**

## 4단계. 사이트에 연결 정보 넣기

1. **Project Settings → API** (또는 상단 **Connect** 버튼)에서 두 값을 복사해요.
   - **Project URL** (예: `https://abcdefgh.supabase.co`)
   - **Publishable key** (`sb_publishable_...` 로 시작. 없으면 `anon public` 키)
   - ⚠️ **`secret` / `service_role` 키는 복사하지 마세요.** 이 사이트는 그 키가 필요 없어요.
2. **내 컴퓨터에서 확인하려면**: 프로젝트 폴더에 `.env.local` 파일을 만들고 (`.env.example` 복사)
   ```
   NEXT_PUBLIC_SUPABASE_URL=복사한 Project URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=복사한 Publishable key
   ```
3. **인터넷에 올린 사이트에 적용하려면**: [Vercel](https://vercel.com) → 프로젝트 → **Settings → Environment Variables** 에 위 두 이름으로 값을 추가해요. (Environments는 **Production, Preview** 모두 체크) → 저장 후 **Redeploy**

## 5단계. 나를 관리자로 만들기

1. 사이트에서 **내 이메일로 회원가입** → 인증 메일의 링크 클릭
2. Supabase **SQL Editor**에서 아래를 실행해요. (이메일을 내 것으로 바꾸세요)
   ```sql
   update public.profiles set role = 'admin' where email = '내이메일@example.com';
   ```
3. 사이트 상단에 **관리자** 메뉴가 나타나요.

> 관리자는 SQL로만 정할 수 있어요. 사이트 화면에서는 누구도 관리자가 될 수 없게 막아뒀어요.

---

## 자주 묻는 질문

**가입 인증 메일이 안 와요.**
Supabase 기본 메일은 발송량이 아주 적고(시간당 몇 통), 프로젝트 팀원 주소로만 보낼 수 있다는 자료도 있어요.
테스트 중에는 **본인(프로젝트 주인) 이메일**로 가입해 보세요. 그래도 안 되면
**Authentication → Users → Add user → Create new user** 에서 *Auto Confirm User* 를 켜고 직접 만들어도 돼요.
정식 오픈 전에는 메일 발송 서비스(Resend로 잠정 결정)를 연결해야 해요. → `OPEN_ITEMS.md`

**무료 플랜이 멈췄어요.**
1주일 동안 접속이 없으면 무료 프로젝트가 일시 정지돼요. 대시보드에서 **Restore project** 를 누르면 돼요.

**데이터베이스를 고치고 싶어요.**
`supabase/migrations/` 에 새 번호의 파일(`0002_...sql`)을 만들어 SQL Editor에서 실행하세요.
고친 뒤에는 `npm run db:test` 로 보안 규칙이 그대로인지 꼭 확인해요.
(새 함수를 만들면 마지막에 `revoke execute ... from public, anon, authenticated;` 로 먼저 막고, 필요한 역할에만 `grant` 하세요.)

---

## 이 구조의 보안 약속 (코드가 아니라 DB가 지켜요)

- **손님은 자기 것만 봐요**: 주문·배송지·찜은 본인만, 비밀 Q&A는 작성자와 관리자만 볼 수 있어요.
- **가격은 서버가 계산해요**: 브라우저가 보낸 가격은 무시하고, `place_order` 함수가 상품 가격·옵션 추가금액·재고·배송비를 다시 계산해요.
- **재고 숫자는 손님에게 안 보여요**: 손님용 `products_public` 뷰에는 품절 여부만 있어요.
- **후기는 구매자만**: 내 주문이 '배송 완료'일 때만, 주문 1건당 1개 쓸 수 있어요.
- **관리자 권한은 DB에 있어요**: 화면을 숨기는 게 아니라, 관리자가 아니면 관리자 데이터가 아예 내려오지 않아요.
- **탈퇴해도 주문 기록은 남아요**: 로그인 정보·배송지·찜만 삭제되고, 주문은 `user_id` 만 비워져요.
