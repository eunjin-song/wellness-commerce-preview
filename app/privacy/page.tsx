import type { Metadata } from "next"
import LegalDocument, { Clause } from "@/components/layout/LegalDocument"
import { BUSINESS, shown } from "@/lib/business"

export const metadata: Metadata = { title: "개인정보처리방침 — ooro." }

export default function PrivacyPage() {
  const operator = BUSINESS.company.trim() || BUSINESS.brand

  return (
    <LegalDocument eyebrow="Privacy" title="개인정보처리방침" effectiveDate={BUSINESS.effectiveDate}>
      <p>
        {operator}(이하 &ldquo;회사&rdquo;)는 개인정보 보호법 등 관련 법령을 지키며, 이용자의 개인정보를 안전하게 다루기 위해 아래와 같이 처리방침을 정하고 공개합니다.
      </p>

      <Clause title="1. 수집하는 개인정보 항목과 방법">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>회원가입</strong>: 이름, 이메일(로그인 아이디), 비밀번호(암호화 저장), 휴대전화번호, 마케팅 수신 동의 여부
          </li>
          <li>
            <strong>주문·배송</strong>: 받는 분 이름, 연락처, 배송지 주소, 배송 메모, 주문 내역
          </li>
          <li>
            <strong>결제</strong>: 결제 수단 정보와 승인 내역은 결제대행사가 처리하며, 회사는 결제 성공 여부와 금액 등 최소한의 기록만 보관합니다.
          </li>
          <li>
            <strong>게시물</strong>: 후기·Q&amp;A에 직접 입력한 글과 첨부한 사진
          </li>
          <li>
            <strong>자동 수집</strong>: 접속 기록, 브라우저·기기 정보, 쿠키 (서비스 이용과 보안을 위해)
          </li>
        </ul>
        <p>수집 방법은 회원가입, 주문, 게시물 작성 등 이용자가 직접 입력하는 방식과 서비스 이용 중 자동으로 생성되는 방식입니다.</p>
      </Clause>

      <Clause title="2. 개인정보의 이용 목적">
        <ul className="list-disc space-y-1 pl-5">
          <li>회원 가입과 관리, 본인 확인, 부정 이용 방지</li>
          <li>상품 주문·결제·배송, 교환·반품·환불 처리</li>
          <li>고객 문의(Q&amp;A) 응대와 공지 전달</li>
          <li>(동의한 경우에 한해) 이벤트·혜택 등 마케팅 정보 안내</li>
          <li>서비스 개선과 통계 분석</li>
        </ul>
      </Clause>

      <Clause title="3. 보유 및 이용 기간">
        <p>원칙적으로 개인정보는 이용 목적이 달성되거나 회원이 탈퇴하면 지체 없이 파기합니다. 다만 법령에 따라 아래 기간 동안 보관합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
          <li>대금 결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
          <li>소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)</li>
          <li>표시·광고에 관한 기록: 6개월 (전자상거래법)</li>
          <li>웹사이트 접속 기록: 3개월 (통신비밀보호법)</li>
        </ul>
        <p>회원이 탈퇴하면 주문 기록은 법정 보관 기간 동안 보관하되 회원과의 연결 정보를 제거합니다.</p>
      </Clause>

      <Clause title="4. 개인정보의 제3자 제공">
        <p>회사는 이용자의 동의가 있거나 법령에 근거가 있는 경우를 제외하고는 개인정보를 제3자에게 제공하지 않습니다. 상품 배송을 위해 택배사에 받는 분의 이름·연락처·주소를 전달할 수 있습니다.</p>
      </Clause>

      <Clause title="5. 개인정보 처리 위탁과 국외 이전">
        <p>회사는 서비스 운영을 위해 다음과 같이 개인정보 처리를 위탁합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase, Inc. — 회원·주문·게시물 데이터 저장 및 인증 (서버 위치: 대한민국 서울 리전)</li>
          <li>Vercel Inc. — 웹사이트 호스팅과 접속 처리 (미국)</li>
          <li>이메일 발송 서비스 — 가입 인증·비밀번호 재설정·주문 안내 메일 발송 (서비스 확정 후 갱신)</li>
          <li>결제대행사 — 결제 처리 (연동 확정 후 갱신)</li>
          <li>택배사 — 상품 배송 (선정 후 갱신)</li>
        </ul>
        <p>위탁받는 자는 위탁 목적 범위를 넘어 개인정보를 이용하지 못하도록 계약으로 관리합니다.</p>
      </Clause>

      <Clause title="6. 개인정보의 파기">
        <p>보유 기간이 끝나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자 파일은 복구할 수 없는 방법으로 삭제하고, 종이 문서는 분쇄하거나 소각합니다.</p>
      </Clause>

      <Clause title="7. 이용자의 권리와 행사 방법">
        <p>이용자는 언제든지 마이페이지에서 개인정보를 조회·수정하고 회원 탈퇴(동의 철회)를 할 수 있습니다. 그 밖의 열람·정정·삭제·처리정지 요구는 아래 개인정보 보호책임자에게 연락해 주세요. 마케팅 수신 동의는 마이페이지에서 언제든 철회할 수 있습니다.</p>
      </Clause>

      <Clause title="8. 쿠키(Cookie)">
        <p>회사는 로그인 상태 유지와 장바구니 보관을 위해 쿠키와 브라우저 저장소를 사용합니다. 이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 등 일부 기능을 이용할 수 없습니다.</p>
      </Clause>

      <Clause title="9. 개인정보의 안전성 확보 조치">
        <ul className="list-disc space-y-1 pl-5">
          <li>비밀번호는 일방향 암호화되어 저장되며 회사도 알 수 없습니다.</li>
          <li>데이터베이스에 접근 권한 규칙을 적용해, 이용자는 본인의 정보만 조회할 수 있습니다.</li>
          <li>전송 구간은 암호화(HTTPS)하며, 관리자 권한은 최소한의 인원에게만 부여합니다.</li>
        </ul>
      </Clause>

      <Clause title="10. 개인정보 보호책임자">
        <p>
          책임자 {shown(BUSINESS.privacyOfficer)} · 이메일 {shown(BUSINESS.privacyEmail)}
        </p>
        <p>고객센터 {shown(BUSINESS.phone)}</p>
        <p>개인정보 침해에 관한 상담이나 신고는 아래 기관에도 문의할 수 있습니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번 없이 118)</li>
          <li>개인정보분쟁조정위원회 (kopico.go.kr / 1833-6972)</li>
          <li>대검찰청 사이버수사과 (spo.go.kr / 국번 없이 1301)</li>
          <li>경찰청 사이버수사국 (ecrm.police.go.kr / 국번 없이 182)</li>
        </ul>
      </Clause>

      <Clause title="11. 처리방침의 변경">
        <p>이 방침이 바뀔 때에는 시행 7일 전부터 몰에 공지하며, 이용자의 권리에 중요한 변경은 30일 전에 공지합니다.</p>
      </Clause>

      <p className="text-xs">이 방침은 {BUSINESS.effectiveDate}부터 시행합니다.</p>
    </LegalDocument>
  )
}
