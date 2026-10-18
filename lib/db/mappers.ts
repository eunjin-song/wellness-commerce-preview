import type {
  Account,
  Address,
  AdminProduct,
  ColorOption,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Question,
  Review,
  ShopSettings,
  SizeOption,
} from "@/lib/types"

/** DB 시간(UTC)을 한국 날짜(YYYY-MM-DD)로 */
export function kstDate(iso: string | null | undefined): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })
}

/* ---------- DB 행 모양 (snake_case) ---------- */

export interface ProductRow {
  id: string
  name: string
  subtitle: string
  category: string
  price: number
  images: string[]
  colors: ColorOption[]
  sizes: SizeOption[]
  ingredients: string
  usage_guide: string
  description: string
  // 공개 뷰
  in_stock?: boolean
  // 관리자용 원본 테이블
  stock?: number
  is_active?: boolean
}

interface ProfileRow {
  id: string
  email: string
  name: string
  phone: string
  marketing_consent: boolean
  role: "customer" | "admin"
  created_at: string
}

interface AddressRow {
  id: string
  label: string
  recipient: string
  phone: string
  zip: string
  address1: string
  address2: string
  is_default: boolean
}

interface OrderItemRow {
  product_id: string | null
  name: string
  price: number
  quantity: number
  thumbnail_url: string | null
  color: string | null
  size: string | null
}

interface OrderRow {
  id: string
  user_id: string | null
  status: OrderStatus
  subtotal: number
  shipping_fee: number
  amount: number
  recipient: string
  phone: string
  zip: string
  address1: string
  address2: string
  memo: string
  created_at: string
  order_items?: OrderItemRow[]
}

interface ReviewRow {
  id: string
  product_id: string
  author_name: string
  rating: number
  content: string
  option_label: string
  images: string[]
  is_hidden: boolean
  created_at: string
  order_id: string | null
}

interface QuestionRow {
  id: string
  product_id: string | null
  author_name: string
  title: string
  content: string
  is_secret: boolean
  is_mine: boolean
  can_view: boolean
  is_answered: boolean
  images: string[]
  answer: string | null
  answered_at: string | null
  created_at: string
}

/* ---------- 변환 (camelCase) ---------- */

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    category: row.category,
    price: row.price,
    inStock: row.in_stock ?? (row.stock ?? 0) > 0,
    isActive: row.is_active ?? true,
    images: row.images ?? [],
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    ingredients: row.ingredients,
    usageGuide: row.usage_guide,
    description: row.description,
  }
}

export function mapAdminProduct(row: ProductRow): AdminProduct {
  return { ...mapProduct(row), stock: row.stock ?? 0 }
}

export function mapAccount(row: ProfileRow): Account {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    marketingConsent: row.marketing_consent,
    role: row.role,
    createdAt: kstDate(row.created_at),
  }
}

export function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    recipient: row.recipient,
    phone: row.phone,
    zip: row.zip,
    address1: row.address1,
    address2: row.address2,
    isDefault: row.is_default,
  }
}

function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    productId: row.product_id,
    name: row.name,
    price: row.price,
    quantity: row.quantity,
    thumbnailUrl: row.thumbnail_url,
    color: row.color ?? undefined,
    size: row.size ?? undefined,
  }
}

export function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    amount: row.amount,
    recipient: row.recipient,
    phone: row.phone,
    zip: row.zip,
    address1: row.address1,
    address2: row.address2,
    memo: row.memo,
    createdAt: kstDate(row.created_at),
    items: (row.order_items ?? []).map(mapOrderItem),
  }
}

export function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author_name,
    rating: row.rating,
    content: row.content,
    option: row.option_label,
    images: row.images ?? [],
    isHidden: row.is_hidden,
    createdAt: kstDate(row.created_at),
    orderId: row.order_id,
  }
}

export function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author_name,
    title: row.title,
    content: row.content,
    isSecret: row.is_secret,
    isMine: row.is_mine,
    canView: row.can_view,
    isAnswered: row.is_answered,
    images: row.images ?? [],
    answer: row.answer ? { content: row.answer, createdAt: kstDate(row.answered_at) } : null,
    createdAt: kstDate(row.created_at),
  }
}

export const DEFAULT_SETTINGS: ShopSettings = { shippingFee: 3000, freeShippingThreshold: 50000 }

export function mapSettings(value: { fee?: number; free_threshold?: number } | null | undefined): ShopSettings {
  return {
    shippingFee: value?.fee ?? DEFAULT_SETTINGS.shippingFee,
    freeShippingThreshold: value?.free_threshold ?? DEFAULT_SETTINGS.freeShippingThreshold,
  }
}
