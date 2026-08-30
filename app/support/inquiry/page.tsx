import InquiryForm from "@/components/support/InquiryForm"

export default function InquiryPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">1:1 문의</h1>
      <p className="mt-2 text-sm text-ink/50">
        궁금하신 점을 남겨주시면 영업일 기준 1~2일 이내 답변드립니다.
      </p>
      <div className="mt-10">
        <InquiryForm />
      </div>
    </main>
  )
}
