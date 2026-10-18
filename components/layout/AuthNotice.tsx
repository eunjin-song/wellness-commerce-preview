"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

/** 이메일 인증을 마치고 돌아왔을 때 한 번 보여주는 안내 (주소의 ?verified=1) */
export default function AuthNotice() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  if (params.get("verified") !== "1" || dismissed) return null

  function close() {
    setDismissed(true)
    const next = new URLSearchParams(params.toString())
    next.delete("verified")
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div role="status" className="bg-brown text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 text-sm">
        <p>이메일 인증이 완료됐어요. ooro.에 오신 걸 환영해요.</p>
        <button type="button" onClick={close} className="underline underline-offset-4">
          닫기
        </button>
      </div>
    </div>
  )
}
