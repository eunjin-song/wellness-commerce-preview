import type { Metadata } from "next"
import { Suspense } from "react"
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"

export const metadata: Metadata = { title: "비밀번호 찾기 — ooro." }

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl">비밀번호 찾기</h1>
      <div className="mt-10">
        <Suspense fallback={null}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}
