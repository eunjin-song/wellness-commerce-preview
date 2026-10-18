import type { Metadata } from "next"
import MyPageShell from "@/components/mypage/MyPageShell"

export const metadata: Metadata = { title: "마이페이지 — ooro." }

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return <MyPageShell>{children}</MyPageShell>
}
