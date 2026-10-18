import type { Metadata } from "next"
import { Suspense } from "react"
import LoginForm from "@/components/auth/LoginForm"

export const metadata: Metadata = { title: "로그인 — ooro." }

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl">로그인</h1>
      <div className="mt-10">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
