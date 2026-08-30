export interface MockReview {
  id: string
  rating: number
  content: string
  author: string
  createdAt: string
}

export interface MockProduct {
  id: string
  slug: string
  name: string
  subtitle: string
  category: string
  price: number
  stock: number
  images: string[]
  ingredients: string
  usageGuide: string
  description: string
  reviews: MockReview[]
}

export const PRODUCTS: MockProduct[] = [
  {
    id: "calm-sleep-serum",
    slug: "calm-sleep-serum",
    name: "캄 슬립 세럼",
    subtitle: "잠들기 전 10분, 마음을 가라앉히는 의식",
    category: "슬립 케어",
    price: 42000,
    stock: 18,
    images: [
      "https://picsum.photos/seed/wellness-serum-1/1000/1000",
      "https://picsum.photos/seed/wellness-serum-2/1000/1000",
      "https://picsum.photos/seed/wellness-serum-3/1000/1000",
    ],
    ingredients:
      "카모마일 추출물, 라벤더 오일, 마그네슘 PCA가 긴장된 몸과 마음을 이완시켜 편안한 수면으로 이어줍니다.",
    usageGuide: "취침 30분 전, 손목과 목 뒤에 2~3방울을 덜어 가볍게 문질러 흡수시켜 주세요.",
    description:
      "하루의 긴장을 내려놓는 시간을 위해 만들었습니다.\n무향의 자극적인 인공 향료 대신, 저용량의 라벤더와 카모마일만으로 은은하게 마음을 가라앉히는 데 집중했습니다.\n매일 밤 같은 자리에 발라주는 작은 루틴이, 하루를 정리하는 신호가 되어줄 거예요.",
    reviews: [
      {
        id: "r1",
        rating: 5,
        content: "향이 과하지 않아서 좋아요. 바르고 나면 정말 잠이 스르륵 오는 느낌이에요.",
        author: "s***2",
        createdAt: "2026-08-12",
      },
      {
        id: "r2",
        rating: 4,
        content: "효과는 좋은데 병 디자인이 조금 더 컸으면 좋겠어요.",
        author: "j***0",
        createdAt: "2026-07-30",
      },
    ],
  },
  {
    id: "daily-collagen-ampoule",
    slug: "daily-collagen-ampoule",
    name: "데일리 콜라겐 앰플",
    subtitle: "매일 아침, 피부에 건네는 짧은 인사",
    category: "스킨케어",
    price: 58000,
    stock: 6,
    images: [
      "https://picsum.photos/seed/wellness-ampoule-1/1000/1000",
      "https://picsum.photos/seed/wellness-ampoule-2/1000/1000",
    ],
    ingredients: "저분자 콜라겐, 판테놀, 병풀 추출물이 피부 결을 정돈하고 수분 장벽을 채워줍니다.",
    usageGuide: "세안 후 토너 다음 단계에서 2~3펌프를 덜어 얼굴 전체에 부드럽게 펴 발라주세요.",
    description:
      "아침에 바르는 5초의 습관이 하루의 피부 컨디션을 바꿉니다.\n끈적임 없이 가볍게 스며드는 제형으로, 메이크업 전 단계에서도 부담 없이 사용할 수 있습니다.",
    reviews: [
      {
        id: "r3",
        rating: 5,
        content: "흡수가 정말 빨라요. 끈적임이 전혀 없어서 아침에 쓰기 좋아요.",
        author: "m***1",
        createdAt: "2026-08-01",
      },
    ],
  },
  {
    id: "balance-magnesium",
    slug: "balance-magnesium",
    name: "밸런스 마그네슘",
    subtitle: "예민한 날에도, 몸의 리듬을 지켜주는",
    category: "이너뷰티",
    price: 36000,
    stock: 0,
    images: [
      "https://picsum.photos/seed/wellness-supplement-1/1000/1000",
      "https://picsum.photos/seed/wellness-supplement-2/1000/1000",
    ],
    ingredients: "마그네슘 비스글리시네이트, 비타민 B6이 신경 안정과 근육 이완을 돕습니다.",
    usageGuide: "1일 1회, 취침 전 1캡슐을 물과 함께 섭취해 주세요.",
    description:
      "바쁜 하루 끝, 몸이 스스로 쉬는 법을 잊지 않도록 돕는 미네랄입니다.\n흡수율이 높은 비스글리시네이트 형태로 만들어 위 부담 없이 편안하게 섭취할 수 있습니다.",
    reviews: [],
  },
  {
    id: "ritual-body-oil",
    slug: "ritual-body-oil",
    name: "리추얼 바디 오일",
    subtitle: "샤워 후 3분, 나에게 집중하는 시간",
    category: "바디케어",
    price: 49000,
    stock: 24,
    images: [
      "https://picsum.photos/seed/wellness-oil-1/1000/1000",
      "https://picsum.photos/seed/wellness-oil-2/1000/1000",
      "https://picsum.photos/seed/wellness-oil-3/1000/1000",
    ],
    ingredients: "호호바 오일, 스위트아몬드 오일, 시어버터가 건조한 피부에 깊은 유연감을 더합니다.",
    usageGuide: "샤워 직후 물기가 남아있는 피부에 적당량을 덜어 마사지하듯 흡수시켜 주세요.",
    description:
      "바디케어를 하루를 마무리하는 의식으로 바꿔줍니다.\n무겁지 않은 텍스처로 산뜻하게 흡수되며, 은은한 우디 향이 오래 남습니다.",
    reviews: [
      {
        id: "r4",
        rating: 5,
        content: "향이 너무 좋아요. 바르고 나면 온 방에 은은하게 퍼져요.",
        author: "h***5",
        createdAt: "2026-08-18",
      },
      {
        id: "r5",
        rating: 5,
        content: "겨울 건성 피부인데 이거 쓰고 각질이 훨씬 줄었어요.",
        author: "y***3",
        createdAt: "2026-08-05",
      },
    ],
  },
]

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id)
}
