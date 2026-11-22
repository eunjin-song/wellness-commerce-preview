"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useAdminProducts, useHomeFeatured, useReorderProducts, useSaveHomeFeatured, useSetProductActive } from "@/lib/queries/admin"
import { toKoreanError } from "@/lib/db/errors"
import { discountPercent, hasPriceVariation } from "@/lib/pricing"
import { won } from "@/lib/format"
import type { AdminProduct } from "@/lib/types"

/** 홈 화면 상단에 크게 보이는 대표 상품 2개를 고릅니다. 비워 두면 순서상 앞의 두 상품이 나와요. */
function HomeFeaturedPicker({ products }: { products: AdminProduct[] }) {
  const saved = useHomeFeatured()
  const save = useSaveHomeFeatured()
  const sellable = products.filter((p) => p.isActive)
  const [draft, setDraft] = useState<[string, string] | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const current: [string, string] = draft ?? [saved.data?.[0] ?? "", saved.data?.[1] ?? ""]
  const setSlot = (slot: 0 | 1, value: string) => {
    const next: [string, string] = [...current]
    next[slot] = value
    setDraft(next)
    setMessage(null)
  }

  async function handleSave() {
    const ids = current.filter(Boolean)
    if (ids.length === 2 && ids[0] === ids[1]) {
      setMessage({ ok: false, text: "같은 상품을 두 번 고를 수 없어요." })
      return
    }
    try {
      await save.mutateAsync(ids)
      setDraft(null)
      setMessage({ ok: true, text: "저장했어요. 홈 화면에 곧 반영돼요(최대 30초)." })
    } catch (err) {
      setMessage({ ok: false, text: toKoreanError(err, "저장하지 못했어요.") })
    }
  }

  return (
    <section aria-labelledby="featured-title" className="rounded-2xl bg-paper p-6">
      <h2 id="featured-title" className="text-sm font-semibold">
        홈 화면 대표 상품 (화면 폭 가득한 큰 사진 2장)
      </h2>
      <p className="mt-1 text-xs leading-relaxed">
        홈 상단에 두 사진이 나란히 크게 보여요. 두 사진 모두, 그리고 오른쪽 사진 아래의 &lsquo;제품 보러가기&rsquo;를 누르면 같은 카테고리 화면으로 이동해요. 이동하는 카테고리는 오른쪽 상품의 카테고리예요(같은 카테고리의 상품 2개를 골라 주세요). 비워 두면 순서상 앞의 두 상품이 나와요.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {([0, 1] as const).map((slot) => (
          <div key={slot}>
            <label htmlFor={`featured-${slot}`} className="field-label">
              {slot === 0 ? "왼쪽 사진 상품" : "오른쪽 사진 상품 (카테고리 기준)"}
            </label>
            <select id={`featured-${slot}`} className="field" value={current[slot]} onChange={(e) => setSlot(slot, e.target.value)}>
              <option value="">자동 (순서대로)</option>
              {sellable.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.category}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" className="btn-primary" disabled={save.isPending || saved.isPending} onClick={handleSave}>
          {save.isPending ? "저장 중…" : "대표 상품 저장"}
        </button>
        {message && (
          <span role={message.ok ? "status" : "alert"} className="text-sm font-medium">
            {message.text}
          </span>
        )}
      </div>
    </section>
  )
}

export default function AdminProductList() {
  const query = useAdminProducts()
  const setActive = useSetProductActive()
  const reorder = useReorderProducts()
  const [error, setError] = useState<string | null>(null)
  const products = query.data ?? []

  // 위·아래로 한 칸씩 옮겨요. 전체 순서를 서버에 한 번에 보내서 중간에 꼬이지 않아요.
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= products.length) return
    const ids = products.map((p) => p.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    setError(null)
    try {
      await reorder.mutateAsync(ids)
    } catch (err) {
      setError(toKoreanError(err, "순서를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."))
    }
  }

  return (
    <div className="space-y-8">
      {!query.isPending && !query.isError && <HomeFeaturedPicker products={products} />}

      <div className="flex items-center justify-between">
        <p className="text-sm">상품 {products.length}개</p>
        <Link href="/admin/products/new" className="btn-primary">
          상품 등록
        </Link>
      </div>

      <p className="-mt-4 text-xs leading-relaxed">
        표의 순서가 홈 &lsquo;SHOP&rsquo;과 SHOP 화면에 그대로 보여요. 오른쪽의 ▲ ▼ 로 옮겨 주세요. (숨김 상품은 고객 화면에 안 보이지만 순서 자리는 유지돼요)
      </p>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      {query.isPending ? (
        <p className="py-10 text-center text-sm">불러오는 중이에요…</p>
      ) : query.isError ? (
        <p role="alert" className="py-10 text-center text-sm">
          상품을 불러오지 못했어요. 관리자 권한이 있는지 확인해 주세요.
        </p>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">상품 목록 (위에서부터 고객 화면 순서)</caption>
            <thead>
              <tr className="border-b border-brown/25 text-xs">
                <th scope="col" className="w-20 py-3 pr-4 font-medium">
                  순서
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  상품
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  가격
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  재고
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
              {products.map((p, index) => {
                const percent = discountPercent(p)
                return (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-5 text-xs tabular-nums">{index + 1}</span>
                        <button
                          type="button"
                          className="rounded border border-brown/30 px-2 py-1 text-xs leading-none disabled:opacity-30"
                          aria-label={`${p.name} 위로 옮기기`}
                          disabled={index === 0 || reorder.isPending}
                          onClick={() => move(index, -1)}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="rounded border border-brown/30 px-2 py-1 text-xs leading-none disabled:opacity-30"
                          aria-label={`${p.name} 아래로 옮기기`}
                          disabled={index === products.length - 1 || reorder.isPending}
                          onClick={() => move(index, 1)}
                        >
                          ▼
                        </button>
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brown/10">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" sizes="48px" />}
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 tabular-nums">
                      {won(p.price)}
                      {percent !== null && p.originalPrice !== null && (
                        <span className="block text-xs">
                          <s>{won(p.originalPrice)}</s> · {percent}% 할인
                        </span>
                      )}
                      {hasPriceVariation(p) && <span className="block text-xs">옵션별 추가금액 있음</span>}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">
                      {p.stock}
                      {p.stock === 0 && <span className="status-pill ml-2">품절</span>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="status-pill" data-tone={p.isActive ? "solid" : undefined}>
                        {p.isActive ? "판매중" : "숨김"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex gap-4 text-xs">
                        <Link href={`/admin/products/${p.id}/edit`} className="underline underline-offset-4">
                          수정
                        </Link>
                        <button
                          type="button"
                          className="underline underline-offset-4"
                          disabled={setActive.isPending}
                          onClick={() => setActive.mutate({ id: p.id, isActive: !p.isActive })}
                        >
                          {p.isActive ? "숨기기" : "노출하기"}
                        </button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
