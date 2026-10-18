export interface ColorOption {
  name: string
  hex: string
}

export interface SeedReview {
  id: string
  rating: number
  content: string
  author: string
  createdAt: string
  option?: string
}

export interface Review extends SeedReview {
  productId: string
  userId?: string
}

export interface Answer {
  content: string
  createdAt: string
}

export interface Question {
  id: string
  /** null이면 상품과 무관한 일반 문의 */
  productId: string | null
  userId?: string
  author: string
  title: string
  content: string
  isSecret: boolean
  createdAt: string
  answer?: Answer
}

export interface Account {
  id: string
  name: string
  email: string
  phone: string
  marketingConsent: boolean
  createdAt: string
}

export interface Address {
  id: string
  label: string
  recipient: string
  phone: string
  zip: string
  address1: string
  address2: string
  isDefault: boolean
}

export type AddressInput = Omit<Address, "id" | "isDefault">

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  thumbnailUrl: string | null
  color?: string
  size?: string
}

export type OrderStatus = "주문 접수" | "결제 완료" | "배송 준비중" | "배송중" | "배송 완료" | "취소"

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  amount: number
  status: OrderStatus
  recipient: string
  phone: string
  zip: string
  address1: string
  address2: string
  memo: string
  createdAt: string
}
