import { redirect } from "next/navigation"

// 1:1 문의는 Q&A 페이지로 합쳐졌습니다. 예전 주소로 들어와도 Q&A로 이동합니다.
export default function InquiryRedirect() {
  redirect("/qna")
}
