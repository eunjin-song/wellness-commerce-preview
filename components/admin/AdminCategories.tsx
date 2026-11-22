"use client"

import { useState } from "react"
import { useAdminProducts, useCategoryMutations } from "@/lib/queries/admin"
import { useCategories } from "@/lib/queries/shop"
import { toKoreanError } from "@/lib/db/errors"

/** 카테고리 관리: 추가 · 이름 변경 · 삭제 · 순서 변경. 순서는 고객 화면의 카테고리 탭 순서예요. */
export default function AdminCategories() {
  const query = useCategories()
  const products = useAdminProducts().data ?? []
  const { add, rename, remove, reorder } = useCategoryMutations()

  const categories = query.data ?? []
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const countOf = (name: string) => products.filter((p) => p.category === name).length
  const uncategorized = products.filter((p) => p.category === "").length
  const busy = add.isPending || rename.isPending || remove.isPending || reorder.isPending

  async function run(action: () => Promise<unknown>, okText: string, failText: string) {
    setMessage(null)
    try {
      await action()
      setMessage({ ok: true, text: okText })
      return true
    } catch (err) {
      setMessage({ ok: false, text: toKoreanError(err, failText) })
      return false
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) {
      setMessage({ ok: false, text: "카테고리 이름을 입력해 주세요." })
      return
    }
    if (await run(() => add.mutateAsync(name), `'${name}' 카테고리를 추가했어요. 맨 뒤에 붙었어요.`, "추가하지 못했어요.")) setNewName("")
  }

  async function handleRename(id: string) {
    const name = editName.trim()
    if (!name) {
      setMessage({ ok: false, text: "카테고리 이름을 입력해 주세요." })
      return
    }
    if (await run(() => rename.mutateAsync({ id, name }), `이름을 '${name}'(으)로 바꿨어요. 이 카테고리의 상품도 함께 바뀌었어요.`, "이름을 바꾸지 못했어요.")) {
      setEditingId(null)
    }
  }

  async function handleDelete(id: string, name: string) {
    const count = countOf(name)
    const warning =
      count > 0
        ? `'${name}' 카테고리를 삭제할까요?\n이 카테고리의 상품 ${count}개는 삭제되지 않고 '미분류'가 돼요.\n삭제하면 되돌릴 수 없어요.`
        : `'${name}' 카테고리를 삭제할까요?\n삭제하면 되돌릴 수 없어요.`
    if (!window.confirm(warning)) return
    setMessage(null)
    try {
      const moved = await remove.mutateAsync(id)
      setMessage({ ok: true, text: moved > 0 ? `'${name}'을(를) 삭제했어요. 상품 ${moved}개는 미분류가 됐어요.` : `'${name}'을(를) 삭제했어요.` })
    } catch (err) {
      setMessage({ ok: false, text: toKoreanError(err, "삭제하지 못했어요.") })
    }
  }

  // 위·아래로 한 칸씩. 전체 순서를 서버에 한 번에 보내요.
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= categories.length) return
    const ids = categories.map((c) => c.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    await run(() => reorder.mutateAsync(ids), "순서를 바꿨어요. 고객 화면의 카테고리 탭 순서에 반영돼요.", "순서를 바꾸지 못했어요.")
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="rounded-2xl bg-paper p-6" noValidate>
        <label htmlFor="new-category" className="field-label">
          카테고리 추가
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="new-category"
            className="field sm:max-w-sm"
            value={newName}
            maxLength={30}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="예: 슬립 케어"
          />
          <button type="submit" className="btn-primary" disabled={busy}>
            {add.isPending ? "추가 중…" : "추가"}
          </button>
        </div>
        <p className="mt-2 text-xs">새 카테고리는 맨 뒤에 붙어요. 상품이 하나도 없는 카테고리는 고객 화면의 탭에 나오지 않아요.</p>
      </form>

      {message && (
        <p role={message.ok ? "status" : "alert"} className={message.ok ? "text-sm font-medium" : "field-error"}>
          {message.text}
        </p>
      )}

      {query.isPending ? (
        <p className="py-10 text-center text-sm">불러오는 중이에요…</p>
      ) : query.isError ? (
        <p role="alert" className="py-10 text-center text-sm">
          카테고리를 불러오지 못했어요.
        </p>
      ) : categories.length === 0 ? (
        <p className="py-10 text-center text-sm">카테고리가 없어요. 위에서 추가해 주세요.</p>
      ) : (
        <>
          <p className="text-xs leading-relaxed">
            표의 순서가 고객 화면의 카테고리 탭 순서예요. ▲ ▼ 로 옮겨 주세요. 이름을 바꾸면 그 카테고리의 상품도 함께 새 이름으로 바뀌고, 삭제하면 상품은 &lsquo;미분류&rsquo;가
            돼요(상품은 지워지지 않아요).
          </p>
          <ul className="divide-y divide-brown/15 border-y border-brown/20">
            {categories.map((c, index) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
                <span className="inline-flex items-center gap-1">
                  <span className="w-5 text-xs tabular-nums">{index + 1}</span>
                  <button
                    type="button"
                    className="rounded border border-brown/30 px-2 py-1 text-xs leading-none disabled:opacity-30"
                    aria-label={`${c.name} 위로 옮기기`}
                    disabled={index === 0 || busy}
                    onClick={() => move(index, -1)}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="rounded border border-brown/30 px-2 py-1 text-xs leading-none disabled:opacity-30"
                    aria-label={`${c.name} 아래로 옮기기`}
                    disabled={index === categories.length - 1 || busy}
                    onClick={() => move(index, 1)}
                  >
                    ▼
                  </button>
                </span>

                {editingId === c.id ? (
                  <form
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleRename(c.id)
                    }}
                  >
                    <label htmlFor={`rename-${c.id}`} className="sr-only">
                      새 이름
                    </label>
                    <input id={`rename-${c.id}`} className="field max-w-xs py-2" value={editName} maxLength={30} autoFocus onChange={(e) => setEditName(e.target.value)} />
                    <button type="submit" className="btn-primary px-5 py-2 text-xs" disabled={busy}>
                      저장
                    </button>
                    <button type="button" className="btn-outline px-5 py-2 text-xs" onClick={() => setEditingId(null)}>
                      취소
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 font-medium">{c.name}</span>
                    <span className="text-xs tabular-nums">상품 {countOf(c.name)}개</span>
                    <span className="inline-flex gap-4 text-xs">
                      <button
                        type="button"
                        className="underline underline-offset-4"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(c.id)
                          setEditName(c.name)
                          setMessage(null)
                        }}
                      >
                        이름 변경
                      </button>
                      <button type="button" className="underline underline-offset-4" disabled={busy} onClick={() => handleDelete(c.id, c.name)}>
                        삭제
                      </button>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
          {uncategorized > 0 && <p className="text-xs">미분류 상품 {uncategorized}개는 &lsquo;전체&rsquo;에서만 보여요. 관리자 &gt; 상품에서 카테고리를 지정해 주세요.</p>}
        </>
      )}
    </div>
  )
}
