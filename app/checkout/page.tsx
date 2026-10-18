import type { Metadata } from "next"
import CheckoutView from "@/components/checkout/CheckoutView"

export const metadata: Metadata = { title: "주문서 — ooro." }

export default function CheckoutPage() {
  return <CheckoutView />
}
