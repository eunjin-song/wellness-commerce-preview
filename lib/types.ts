export interface ColorOption {
  name: string
  hex: string
  /** 이 색상을 고르면 기본 가격에 더해지는 금액 */
  extra?: number
}

export interface SizeOption {
  name: string
  /** 이 사이즈를 고르면 기본 가격에 더해지는 금액 */
  extra?: number
}

export interface Product {
  id: string
  name: string
  subtitle: string
  category: string
  /** 기본 가격. 옵션을 고르면 옵션의 추가 금액이 더해집니다. */
  price: number
  /** 고객에게는 품절 여부만 알려줍니다 (재고 숫자는 관리자만 봐요). */
  inStock: boolean
  isActive: boolean
  images: string[]
  colors: ColorOption[]
  sizes: SizeOption[]
  ingredients: string
  usageGuide: string
  description: string
}

/** 관리자 화면용: 재고 숫자까지 포함 */
export interface AdminProduct extends Product {
  stock: number
}

export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  content: string
  option: string
  images: string[]
  isHidden: boolean
  createdAt: string
  orderId: string | null
}

export interface Answer {
  content: string
  createdAt: string
}

export interface Question {
  id: string
  /** null이면 상품과 무관한 일반 문의 */
  productId: string | null
  author: string
  title: string
  content: string
  isSecret: boolean
  isMine: boolean
  canView: boolean
  isAnswered: boolean
  /** question-photos 저장소 안의 경로 (보려면 임시 주소를 받아야 해요) */
  images: string[]
  answer: Answer | null
  createdAt: string
}

export interface Account {
  id: string
  email: string
  name: string
  phone: string
  marketingConsent: boolean
  role: "customer" | "admin"
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
  productId: string | null
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
  userId: string | null
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

export interface ShopSettings {
  shippingFee: number
  freeShippingThreshold: number
}
