"use client"

import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@/lib/hooks"
import { useToggleWish, useWishlistIds } from "@/lib/queries/account"

export default function HeartButton({ productId, className = "" }: { productId: string; className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()
  const wishlist = useWishlistIds()
  const toggle = useToggleWish()

  const wished = user !== null && (wishlist.data?.includes(productId) ?? false)

  function handleClick() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    toggle.mutate({ productId, wished })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={wished}
      aria-label={wished ? "찜 해제" : "찜하기"}
      disabled={toggle.isPending}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-brown transition ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={wished ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      >
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.5C19.5 15.9 12 20.5 12 20.5Z" />
      </svg>
    </button>
  )
}
