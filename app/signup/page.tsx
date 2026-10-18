import type { Metadata } from "next"
import { Suspense } from "react"
import SignupForm from "@/components/auth/SignupForm"

export const metadata: Metadata = { title: "회원가입 — ooro." }

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl">회원가입</h1>
      <div className="mt-10">
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  )
}
