import type { Question } from "@/lib/types"

/** 샘플 Q&A — 실제 서비스에서는 DB에서 불러옵니다. */
export const SEED_QUESTIONS: Question[] = [
  {
    id: "q1",
    productId: "calm-sleep-serum",
    author: "정*아",
    title: "임산부도 사용할 수 있나요?",
    content: "라벤더 오일이 들어 있어서 임신 중에도 써도 되는지 궁금해요.",
    isSecret: false,
    createdAt: "2026-09-10",
    answer: {
      content:
        "안녕하세요, ooro.입니다. 임신 중에는 에센셜 오일 성분에 민감해질 수 있어 담당 의료진과 상의 후 사용하시길 권해드려요. 사용 전 손목 안쪽에 소량 테스트도 꼭 해주세요.",
      createdAt: "2026-09-11",
    },
  },
  {
    id: "q2",
    productId: "daily-collagen-ampoule",
    author: "박*진",
    title: "30ml와 50ml 차이가 용량뿐인가요?",
    content: "성분이나 제형이 동일한지 궁금합니다.",
    isSecret: false,
    createdAt: "2026-09-05",
    answer: {
      content: "네, 용량만 다르고 성분과 제형은 동일해요. 처음 사용하신다면 30ml로 먼저 써보시길 추천드려요.",
      createdAt: "2026-09-06",
    },
  },
  {
    id: "q3",
    productId: "linen-sleep-robe",
    author: "최*은",
    title: "키 168cm에 M 사이즈가 맞을까요?",
    content: "평소 상의는 55를 입어요. 발목 위까지 오는 길이를 원합니다.",
    isSecret: false,
    createdAt: "2026-09-14",
  },
  {
    id: "q4",
    productId: null,
    author: "한*수",
    title: "배송은 보통 얼마나 걸리나요?",
    content: "주문 후 대략 며칠 정도 걸리는지 알고 싶어요.",
    isSecret: false,
    createdAt: "2026-09-08",
    answer: {
      content: "결제 완료 후 영업일 기준 1~3일 안에 출고되고, 출고 후 1~2일 내 받아보실 수 있어요.",
      createdAt: "2026-09-08",
    },
  },
  {
    id: "q5",
    productId: "silk-eye-mask",
    author: "오*림",
    title: "주문 건 문의드립니다",
    content: "비밀글로 남깁니다.",
    isSecret: true,
    createdAt: "2026-09-12",
    answer: { content: "확인 후 개별 연락드렸어요. 감사합니다.", createdAt: "2026-09-12" },
  },
]
