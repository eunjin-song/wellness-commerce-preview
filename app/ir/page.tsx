import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import IrPagination from "@/components/ir/IrPagination"
import ServerNotice from "@/components/layout/ServerNotice"
import { IR_PAGE_SIZE, getIrPosts } from "@/lib/db/public"
import { dotDate } from "@/lib/db/mappers"

export const metadata: Metadata = {
  title: "IR — ooro.",
  description: "ooro.의 공고·공시 정보를 확인하세요.",
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function IrPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Math.floor(Number(pageParam)) || 1)
  const { posts, total, configured, failed } = await getIrPosts(page)
  const totalPages = Math.max(1, Math.ceil(total / IR_PAGE_SIZE))

  // 없는 페이지 번호로 들어오면 마지막 페이지로 보내요.
  if (configured && !failed && page > totalPages) redirect(totalPages === 1 ? "/ir" : `/ir?page=${totalPages}`)

  const firstNumber = total - (page - 1) * IR_PAGE_SIZE

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-14 md:px-10 md:pt-20">
      <header className="mb-10 text-center md:mb-14">
        <p className="eyebrow">Company</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">IR</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed">공고와 공시 정보를 확인하실 수 있어요.</p>
      </header>

      {!configured || failed ? (
        <ServerNotice configured={configured} />
      ) : posts.length === 0 ? (
        <p className="border-y border-brown/20 py-20 text-center text-sm">등록된 공고가 없어요.</p>
      ) : (
        <>
          <div role="table" aria-label="공고·공시 목록" className="border-t border-brown/40 text-sm">
            <div role="row" className="hidden border-b border-brown/20 py-4 text-center text-xs font-medium md:grid md:grid-cols-[80px_1fr_110px_120px_90px]">
              <span role="columnheader">Number</span>
              <span role="columnheader">Title</span>
              <span role="columnheader">Author</span>
              <span role="columnheader">Date</span>
              <span role="columnheader">Views</span>
            </div>

            {posts.map((post, index) => (
              <div
                key={post.id}
                role="row"
                className="border-b border-brown/15 py-4 md:grid md:grid-cols-[80px_1fr_110px_120px_90px] md:items-center md:py-5 md:text-center"
              >
                <span role="cell" className="hidden tabular-nums md:block">
                  {firstNumber - index}
                </span>
                <span role="cell" className="block md:px-4 md:text-left">
                  <Link href={`/ir/${post.id}`} className="font-medium underline-offset-4 hover:underline">
                    {post.title}
                  </Link>
                  {post.filePath && <span className="ml-2 text-xs opacity-70">첨부</span>}
                  {/* 모바일에서는 작성자·날짜·조회수를 제목 아래 한 줄로 */}
                  <span className="mt-1.5 block text-xs opacity-70 md:hidden">
                    {post.author} · {dotDate(post.publishedAt)} · 조회 {post.views.toLocaleString("ko-KR")}
                  </span>
                </span>
                <span role="cell" className="hidden md:block">
                  {post.author}
                </span>
                <span role="cell" className="hidden tabular-nums md:block">
                  {dotDate(post.publishedAt)}
                </span>
                <span role="cell" className="hidden tabular-nums md:block">
                  {post.views.toLocaleString("ko-KR")}
                </span>
              </div>
            ))}
          </div>

          <IrPagination page={page} totalPages={totalPages} />
        </>
      )}
    </main>
  )
}
