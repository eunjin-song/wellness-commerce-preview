"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

/**
 * 글을 열면 조회수를 1 올려요. 같은 브라우저 탭에서 같은 글을 다시 열어도 한 번만 올려서,
 * 새로고침으로 숫자가 마구 늘지 않게 해요. (화면에는 아무것도 그리지 않아요)
 */
export default function IrViewCounter({ id }: { id: number }) {
  useEffect(() => {
    const key = `ir-viewed-${id}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "1")
    } catch {
      // 저장소를 못 쓰는 환경이면 그냥 한 번 올려요.
    }
    createClient()
      ?.rpc("increment_ir_views", { p_id: id })
      .then(() => undefined, () => undefined)
  }, [id])

  return null
}
