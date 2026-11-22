import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import IrViewCounter from "@/components/ir/IrViewCounter"
import ServerNotice from "@/components/layout/ServerNotice"
import { getIrPost } from "@/lib/db/public"
import { dotDate } from "@/lib/db/mappers"
import { irFileUrl } from "@/lib/supabase/config"

interface Props {
  params: Promise<{ id: string }>
}

const parseId = (value: string) => (/^\d+$/.test(value) ? Number(value) : null)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id)
  if (id === null) return {}
  const { post } = await getIrPost(id)
  return post ? { title: `${post.title} — ooro. IR` } : {}
}

export default async function IrPostPage({ params }: Props) {
  const id = parseId((await params).id)
  if (id === null) notFound()

  const { post, configured, failed } = await getIrPost(id)
  if (!configured || failed) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <ServerNotice configured={configured} />
      </main>
    )
  }
  if (!post) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-14 md:pt-20">
      <IrViewCounter id={post.id} />

      <p className="eyebrow">IR</p>
      <h1 className="mt-4 font-display text-3xl leading-snug md:text-4xl">{post.title}</h1>
      <p className="mt-4 text-xs tabular-nums opacity-80">
        {post.author} · {dotDate(post.publishedAt)} · 조회 {post.views.toLocaleString("ko-KR")}
      </p>

      {post.filePath && (
        <div className="mt-8 rounded-md bg-paper px-5 py-4 text-sm">
          <span className="mr-3 text-xs font-medium">첨부파일</span>
          <a href={irFileUrl(post.filePath)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {post.fileName || "파일 열기"}
          </a>
        </div>
      )}

      <div className="mt-8 whitespace-pre-line border-t border-brown/20 pt-8 text-sm leading-relaxed">{post.content || "첨부파일을 확인해 주세요."}</div>

      <div className="mt-14 border-t border-brown/20 pt-8 text-center">
        <Link href="/ir" className="btn-outline">
          목록으로
        </Link>
      </div>
    </main>
  )
}
