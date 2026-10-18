import type { Metadata } from "next"
import ResetPasswordForm from "@/components/auth/ResetPasswordForm"

export const metadata: Metadata = { title: "새 비밀번호 만들기 — ooro." }

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl">새 비밀번호 만들기</h1>
      <div className="mt-10">
        <ResetPasswordForm />
      </div>
    </main>
  )
}
