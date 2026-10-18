"use client"

import Image from "next/image"
import Link from "next/link"
import { useApp } from "@/lib/store/app"
import { useCatalog } from "@/lib/hooks"
import { hasPriceVariation } from "@/lib/pricing"
import { won } from "@/lib/format"

export default function AdminProductList() {
  const catalog = useCatalog()
  const saveProduct = useApp((s) => s.saveProduct)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm">상품 {catalog.length}개</p>
        <Link href="/admin/products/new" className="btn-primary">
          상품 등록
        </Link>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">상품 목록</caption>
          <thead>
            <tr className="border-b border-brown/25 text-xs">
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
            {catalog.map((p) => {
              const active = p.isActive !== false
              return (
                <tr key={p.id}>
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
                    {hasPriceVariation(p) && <span className="block text-xs">옵션별 추가금액 있음</span>}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    {p.stock}
                    {p.stock === 0 && <span className="status-pill ml-2">품절</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="status-pill" data-tone={active ? "solid" : undefined}>
                      {active ? "판매중" : "숨김"}
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
                        onClick={() => saveProduct({ ...p, isActive: !active })}
                      >
                        {active ? "숨기기" : "노출하기"}
                      </button>
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
