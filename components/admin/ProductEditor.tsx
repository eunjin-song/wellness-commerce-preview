"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/mock/products"
import { PRODUCTS } from "@/lib/mock/products"
import { useApp } from "@/lib/store/app"
import { uid } from "@/lib/format"
import ImagePicker from "@/components/ui/ImagePicker"

interface ColorRow {
  name: string
  hex: string
  extra: string
}
interface SizeRow {
  name: string
  extra: string
}

/** 쉼표·공백을 허용하는 0 이상의 정수. 잘못된 값이면 null */
function parseWon(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim()
  if (cleaned === "") return 0
  const n = Number(cleaned)
  return Number.isInteger(n) && n >= 0 ? n : null
}

export default function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter()
  const saveProduct = useApp((s) => s.saveProduct)
  const removeCustomProduct = useApp((s) => s.removeCustomProduct)
  const isSample = product ? PRODUCTS.some((p) => p.id === product.id) : false

  const [name, setName] = useState(product?.name ?? "")
  const [subtitle, setSubtitle] = useState(product?.subtitle ?? "")
  const [category, setCategory] = useState(product?.category ?? "")
  const [price, setPrice] = useState(product ? String(product.price) : "")
  const [stock, setStock] = useState(product ? String(product.stock) : "0")
  const [isActive, setIsActive] = useState(product?.isActive !== false)
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [colors, setColors] = useState<ColorRow[]>(
    product?.colors?.map((c) => ({ name: c.name, hex: c.hex, extra: String(c.extra ?? 0) })) ?? []
  )
  const [sizes, setSizes] = useState<SizeRow[]>(product?.sizes?.map((s) => ({ name: s.name, extra: String(s.extra ?? 0) })) ?? [])
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "")
  const [usageGuide, setUsageGuide] = useState(product?.usageGuide ?? "")
  const [description, setDescription] = useState(product?.description ?? "")

  const [errors, setErrors] = useState<string[]>([])
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found: string[] = []

    const priceValue = parseWon(price)
    const stockValue = parseWon(stock)
    if (!name.trim()) found.push("상품명을 입력해 주세요.")
    if (!category.trim()) found.push("카테고리를 입력해 주세요.")
    if (price.trim() === "" || priceValue === null) found.push("기본 가격은 0 이상의 숫자로 입력해 주세요.")
    if (stockValue === null) found.push("재고는 0 이상의 숫자로 입력해 주세요.")
    if (images.length === 0) found.push("상품 사진을 1장 이상 올려주세요.")

    const colorNames = colors.map((c) => c.name.trim())
    const sizeNames = sizes.map((s) => s.name.trim())
    if (colorNames.some((n) => !n)) found.push("색상 이름을 모두 입력해 주세요. 필요 없는 줄은 삭제해 주세요.")
    if (sizeNames.some((n) => !n)) found.push("사이즈 이름을 모두 입력해 주세요. 필요 없는 줄은 삭제해 주세요.")
    if (new Set(colorNames).size !== colorNames.length) found.push("같은 이름의 색상이 있어요.")
    if (new Set(sizeNames).size !== sizeNames.length) found.push("같은 이름의 사이즈가 있어요.")
    if (colors.some((c) => parseWon(c.extra) === null) || sizes.some((s) => parseWon(s.extra) === null)) {
      found.push("옵션 추가금액은 0 이상의 숫자로 입력해 주세요.")
    }

    setErrors(found)
    if (found.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const next: Product = {
      id: product?.id ?? `p-${uid()}`,
      name: name.trim(),
      subtitle: subtitle.trim(),
      category: category.trim(),
      price: priceValue ?? 0,
      stock: stockValue ?? 0,
      isActive,
      images,
      colors: colors.length > 0 ? colors.map((c) => ({ name: c.name.trim(), hex: c.hex, extra: parseWon(c.extra) ?? 0 })) : undefined,
      sizes: sizes.length > 0 ? sizes.map((s) => ({ name: s.name.trim(), extra: parseWon(s.extra) ?? 0 })) : undefined,
      ingredients: ingredients.trim(),
      usageGuide: usageGuide.trim(),
      description: description.trim(),
      reviews: product?.reviews ?? [],
    }
    saveProduct(next)
    router.push("/admin/products")
  }

  function makeCover(index: number) {
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)])
  }

  function handleDelete() {
    if (!product) return
    removeCustomProduct(product.id)
    router.push("/admin/products")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      {errors.length > 0 && (
        <div role="alert" className="rounded-2xl border border-brown p-5 text-sm">
          <p className="font-medium">입력을 확인해 주세요.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="space-y-5" aria-labelledby="basic">
        <h3 id="basic" className="text-sm font-semibold">
          기본 정보
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="p-name" className="field-label">
              상품명
            </label>
            <input id="p-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="p-category" className="field-label">
              카테고리
            </label>
            <input id="p-category" className="field" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="예: 슬립 케어" />
          </div>
        </div>
        <div>
          <label htmlFor="p-subtitle" className="field-label">
            한 줄 소개
          </label>
          <input id="p-subtitle" className="field" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="p-price" className="field-label">
              기본 가격 (원)
            </label>
            <input id="p-price" inputMode="numeric" className="field tabular-nums" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label htmlFor="p-stock" className="field-label">
              재고 (고객에게 보이지 않아요)
            </label>
            <input id="p-stock" inputMode="numeric" className="field tabular-nums" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          <div>
            <label htmlFor="p-active" className="field-label">
              판매 상태
            </label>
            <select id="p-active" className="field" value={isActive ? "on" : "off"} onChange={(e) => setIsActive(e.target.value === "on")}>
              <option value="on">판매중</option>
              <option value="off">숨김 (고객 화면에 안 보임)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="photos">
        <h3 id="photos" className="text-sm font-semibold">
          상품 사진
        </h3>
        <ImagePicker value={images} onChange={setImages} max={8} label="사진" onMakeCover={makeCover} />
        <p className="text-xs">첫 번째 사진이 대표 사진이에요.</p>
      </section>

      <section className="space-y-4" aria-labelledby="colors">
        <h3 id="colors" className="text-sm font-semibold">
          색상 옵션 <span className="font-normal">(없으면 비워두세요)</span>
        </h3>
        {colors.map((c, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            <div className="min-w-32 flex-1">
              <label htmlFor={`color-name-${i}`} className="field-label">
                이름
              </label>
              <input id={`color-name-${i}`} className="field" value={c.name} onChange={(e) => setColors((rows) => rows.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))} />
            </div>
            <div>
              <label htmlFor={`color-hex-${i}`} className="field-label">
                색
              </label>
              <input
                id={`color-hex-${i}`}
                type="color"
                className="h-[46px] w-16 cursor-pointer rounded-xl border border-brown/25 bg-paper p-1"
                value={c.hex}
                onChange={(e) => setColors((rows) => rows.map((r, idx) => (idx === i ? { ...r, hex: e.target.value } : r)))}
              />
            </div>
            <div className="w-36">
              <label htmlFor={`color-extra-${i}`} className="field-label">
                추가금액 (원)
              </label>
              <input id={`color-extra-${i}`} inputMode="numeric" className="field tabular-nums" value={c.extra} onChange={(e) => setColors((rows) => rows.map((r, idx) => (idx === i ? { ...r, extra: e.target.value } : r)))} />
            </div>
            <button type="button" className="btn-outline px-4" onClick={() => setColors((rows) => rows.filter((_, idx) => idx !== i))} aria-label={`색상 ${i + 1} 삭제`}>
              삭제
            </button>
          </div>
        ))}
        <button type="button" className="btn-outline" onClick={() => setColors((rows) => [...rows, { name: "", hex: "#7a6855", extra: "0" }])}>
          색상 추가
        </button>
      </section>

      <section className="space-y-4" aria-labelledby="sizes">
        <h3 id="sizes" className="text-sm font-semibold">
          사이즈 옵션 <span className="font-normal">(없으면 비워두세요)</span>
        </h3>
        {sizes.map((s, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            <div className="min-w-32 flex-1">
              <label htmlFor={`size-name-${i}`} className="field-label">
                이름
              </label>
              <input id={`size-name-${i}`} className="field" value={s.name} onChange={(e) => setSizes((rows) => rows.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))} placeholder="예: M, 50ml" />
            </div>
            <div className="w-36">
              <label htmlFor={`size-extra-${i}`} className="field-label">
                추가금액 (원)
              </label>
              <input id={`size-extra-${i}`} inputMode="numeric" className="field tabular-nums" value={s.extra} onChange={(e) => setSizes((rows) => rows.map((r, idx) => (idx === i ? { ...r, extra: e.target.value } : r)))} />
            </div>
            <button type="button" className="btn-outline px-4" onClick={() => setSizes((rows) => rows.filter((_, idx) => idx !== i))} aria-label={`사이즈 ${i + 1} 삭제`}>
              삭제
            </button>
          </div>
        ))}
        <button type="button" className="btn-outline" onClick={() => setSizes((rows) => [...rows, { name: "", extra: "0" }])}>
          사이즈 추가
        </button>
        <p className="text-xs">추가금액은 기본 가격에 더해져요. 색상과 사이즈를 모두 고르면 두 금액이 합산돼요.</p>
      </section>

      <section className="space-y-5" aria-labelledby="content">
        <h3 id="content" className="text-sm font-semibold">
          상세 내용
        </h3>
        <div>
          <label htmlFor="p-ingredients" className="field-label">
            핵심 성분 &amp; 효능
          </label>
          <textarea id="p-ingredients" className="field resize-none" rows={3} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
        </div>
        <div>
          <label htmlFor="p-usage" className="field-label">
            사용 방법
          </label>
          <textarea id="p-usage" className="field resize-none" rows={3} value={usageGuide} onChange={(e) => setUsageGuide(e.target.value)} />
        </div>
        <div>
          <label htmlFor="p-description" className="field-label">
            상세 설명
          </label>
          <textarea id="p-description" className="field resize-none" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-brown/25 pt-8">
        <button type="submit" className="btn-primary">
          {product ? "수정 저장" : "상품 등록"}
        </button>
        <button type="button" className="btn-outline" onClick={() => router.push("/admin/products")}>
          취소
        </button>

        {product && !isSample && (
          <span className="ml-auto">
            {confirmingDelete ? (
              <span className="flex items-center gap-3 text-sm">
                정말 삭제할까요?
                <button type="button" className="font-medium underline underline-offset-4" onClick={handleDelete}>
                  삭제
                </button>
                <button type="button" className="underline underline-offset-4" onClick={() => setConfirmingDelete(false)}>
                  취소
                </button>
              </span>
            ) : (
              <button type="button" className="text-xs underline underline-offset-4" onClick={() => setConfirmingDelete(true)}>
                상품 삭제
              </button>
            )}
          </span>
        )}
        {product && isSample && <span className="ml-auto text-xs">샘플 상품은 삭제 대신 &apos;숨김&apos;으로 바꿀 수 있어요.</span>}
      </div>
    </form>
  )
}
