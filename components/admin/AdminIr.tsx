"use client"

import Link from "next/link"
import { useState } from "react"
import { useAdminIrPosts, useDeleteIrPost, useSaveIrPost } from "@/lib/queries/admin"
import { toKoreanError } from "@/lib/db/errors"
import { dotDate } from "@/lib/db/mappers"
import type { IrPost } from "@/lib/types"

const MAX_FILE_MB = 20
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

const todayKst = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })

/** 글 하나를 쓰거나 고치는 양식 */
function IrForm({ post, onDone }: { post?: IrPost; onDone: () => void }) {
  const save = useSaveIrPost()
  const [title, setTitle] = useState(post?.title ?? "")
  const [author, setAuthor] = useState(post?.author ?? "ooro.")
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt ?? todayKst())
  const [content, setContent] = useState(post?.content ?? "")
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? true)
  const [file, setFile] = useState<File | null>(null)
  const [removeFile, setRemoveFile] = useState(false)
  const [fileKey, setFileKey] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null
    if (!picked) {
      setFile(null)
      return
    }
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setError("PDF 또는 이미지(JPG·PNG·WEBP) 파일만 올릴 수 있어요.")
      setFile(null)
      setFileKey((k) => k + 1)
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`파일은 ${MAX_FILE_MB}MB 이하만 올릴 수 있어요.`)
      setFile(null)
      setFileKey((k) => k + 1)
      return
    }
    setError(null)
    setFile(picked)
    setRemoveFile(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError("제목을 입력해 주세요.")
    if (!author.trim()) return setError("작성자를 입력해 주세요.")
    if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) return setError("게시일을 선택해 주세요.")
    if (!content.trim() && !file && (!post?.filePath || removeFile)) return setError("내용을 쓰거나 첨부파일을 올려 주세요.")

    setError(null)
    try {
      await save.mutateAsync({
        id: post?.id,
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
        publishedAt,
        isPublished,
        newFile: file,
        removeFile,
        existingFilePath: post?.filePath,
        existingFileName: post?.fileName,
      })
      onDone()
    } catch (err) {
      setError(toKoreanError(err, "저장하지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-paper p-6" noValidate>
      <h2 className="text-sm font-semibold">{post ? "공고·공시 수정" : "새 공고·공시 등록"}</h2>

      <div>
        <label htmlFor="ir-title" className="field-label">
          제목
        </label>
        <input id="ir-title" className="field" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="예: 분기보고서(2026.09)" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="ir-author" className="field-label">
            작성자
          </label>
          <input id="ir-author" className="field" value={author} maxLength={40} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ir-date" className="field-label">
            게시일
          </label>
          <input id="ir-date" type="date" className="field" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ir-status" className="field-label">
            공개 여부
          </label>
          <select id="ir-status" className="field" value={isPublished ? "on" : "off"} onChange={(e) => setIsPublished(e.target.value === "on")}>
            <option value="on">공개 (IR 페이지에 보임)</option>
            <option value="off">숨김 (관리자만 보임)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ir-content" className="field-label">
          내용 <span className="font-normal">(선택 — 첨부파일만 올려도 돼요)</span>
        </label>
        <textarea id="ir-content" className="field resize-y" rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
      </div>

      <div>
        <label htmlFor="ir-file" className="field-label">
          첨부파일 <span className="font-normal">(PDF 또는 이미지, 최대 {MAX_FILE_MB}MB, 1개)</span>
        </label>
        {post?.filePath && !removeFile && !file && (
          <p className="mb-2 text-sm">
            현재 파일: <strong className="font-medium">{post.fileName || "첨부파일"}</strong>{" "}
            <button type="button" className="ml-2 text-xs underline underline-offset-4" onClick={() => setRemoveFile(true)}>
              파일 삭제
            </button>
          </p>
        )}
        {removeFile && (
          <p className="mb-2 text-sm">
            저장하면 현재 파일이 삭제돼요.{" "}
            <button type="button" className="ml-1 text-xs underline underline-offset-4" onClick={() => setRemoveFile(false)}>
              되돌리기
            </button>
          </p>
        )}
        <input
          key={fileKey}
          id="ir-file"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="block w-full text-sm file:mr-4 file:cursor-pointer file:rounded-full file:border file:border-brown file:bg-transparent file:px-5 file:py-2 file:text-sm file:font-medium file:text-brown"
        />
        <p className="mt-2 text-xs leading-relaxed">
          파일 주소를 아는 사람은 누구나 열 수 있어요(숨김 글의 파일도 마찬가지예요). 공개하면 안 되는 문서는 올리지 마세요.
          {post?.filePath && " 새 파일을 올리면 현재 파일은 교체돼요."}
        </p>
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={save.isPending}>
          {save.isPending ? "저장 중…" : post ? "수정 저장" : "등록"}
        </button>
        <button type="button" className="btn-outline" onClick={onDone} disabled={save.isPending}>
          취소
        </button>
      </div>
    </form>
  )
}

/** IR(공고·공시) 관리: 글 등록·수정·삭제·숨김 */
export default function AdminIr() {
  const query = useAdminIrPosts()
  const remove = useDeleteIrPost()
  const [mode, setMode] = useState<{ type: "list" } | { type: "new" } | { type: "edit"; post: IrPost }>({ type: "list" })
  const [error, setError] = useState<string | null>(null)
  const posts = query.data ?? []

  async function handleDelete(post: IrPost) {
    if (!window.confirm(`'${post.title}' 글을 삭제할까요?\n첨부파일도 함께 삭제되고, 되돌릴 수 없어요.`)) return
    setError(null)
    try {
      await remove.mutateAsync(post)
    } catch (err) {
      setError(toKoreanError(err, "삭제하지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  if (mode.type !== "list") {
    return <IrForm key={mode.type === "edit" ? mode.post.id : "new"} post={mode.type === "edit" ? mode.post : undefined} onDone={() => setMode({ type: "list" })} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          공고·공시 {posts.length}건 ·{" "}
          <Link href="/ir" target="_blank" className="underline underline-offset-4">
            IR 페이지 보기
          </Link>
        </p>
        <button type="button" className="btn-primary" onClick={() => setMode({ type: "new" })}>
          새 글 등록
        </button>
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      {query.isPending ? (
        <p className="py-10 text-center text-sm">불러오는 중이에요…</p>
      ) : query.isError ? (
        <p role="alert" className="py-10 text-center text-sm">
          IR 글을 불러오지 못했어요. 서버에 0008 설정이 적용됐는지 확인해 주세요.
        </p>
      ) : posts.length === 0 ? (
        <p className="py-10 text-center text-sm">아직 등록된 글이 없어요. &lsquo;새 글 등록&rsquo;으로 공고나 공시를 올려 주세요.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">IR 글 목록</caption>
            <thead>
              <tr className="border-b border-brown/25 text-xs">
                <th scope="col" className="py-3 pr-4 font-medium">
                  제목
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  작성자
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  게시일
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">
                  조회수
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  상태
                </th>
                <th scope="col" className="py-3 font-medium">
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown/15">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="py-3 pr-4">
                    <span className="font-medium">{post.title}</span>
                    {post.filePath && <span className="ml-2 text-xs opacity-70">첨부</span>}
                  </td>
                  <td className="py-3 pr-4">{post.author}</td>
                  <td className="py-3 pr-4 tabular-nums">{dotDate(post.publishedAt)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{post.views.toLocaleString("ko-KR")}</td>
                  <td className="py-3 pr-4">
                    <span className="status-pill" data-tone={post.isPublished ? "solid" : undefined}>
                      {post.isPublished ? "공개" : "숨김"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex gap-4 text-xs">
                      <button type="button" className="underline underline-offset-4" onClick={() => setMode({ type: "edit", post })}>
                        수정
                      </button>
                      <button type="button" className="underline underline-offset-4" disabled={remove.isPending} onClick={() => handleDelete(post)}>
                        삭제
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
