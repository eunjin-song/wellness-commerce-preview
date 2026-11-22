import type { Metadata } from "next"
import { Suspense } from "react"
import SignupForm from "@/components/auth/SignupForm"

export const metadata: Metadata = { title: "회원가입 — ooro." }

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="eyebrow">Join</p>
      <h1 className="mt-3 font-display text-4xl">회원가입</h1>
      <div className="mt-10">
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  )
}
