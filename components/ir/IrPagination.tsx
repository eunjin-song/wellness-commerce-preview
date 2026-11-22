import Link from "next/link"

const WINDOW = 10

/** 페이지 번호: 1 2 3 ... 10 » Last (10개씩 묶음으로 넘겨요) */
export default function IrPagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null

  const start = Math.floor((page - 1) / WINDOW) * WINDOW + 1
  const end = Math.min(start + WINDOW - 1, totalPages)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
  const href = (p: number) => (p === 1 ? "/ir" : `/ir?page=${p}`)

  const base = "flex h-10 min-w-10 items-center justify-center border border-brown/20 px-3 text-xs transition hover:border-brown"

  return (
    <nav aria-label="페이지 이동" className="mt-12">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        {start > 1 && (
          <li>
            <Link href={href(start - 1)} className={base} aria-label="이전 10페이지">
              «
            </Link>
          </li>
        )}
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={href(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${base} ${p === page ? "border-brown bg-brown text-cream" : ""}`}
            >
              {p}
            </Link>
          </li>
        ))}
        {end < totalPages && (
          <>
            <li>
              <Link href={href(end + 1)} className={base} aria-label="다음 10페이지">
                »
              </Link>
            </li>
            <li>
              <Link href={href(totalPages)} className={base}>
                Last
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}
