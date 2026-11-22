// 정식 오픈할 때 true로 바꾸고 push하면 www.ooro.store에 전체 사이트가 공개됩니다.
export const LAUNCHED = false

// Vercel의 production 배포에서만 커밍순 페이지를 보여줍니다.
// 로컬(npm run dev)과 Vercel preview 배포에서는 전체 사이트가 그대로 보입니다.
export const isComingSoon = !LAUNCHED && process.env.VERCEL_ENV === "production"

/** 사이트 대표 주소 (검색 결과·공유 미리보기에서 쓰는 기준 주소) */
export const SITE_URL = "https://www.ooro.store"

/**
 * 검색 엔진에 노출할지 여부.
 * 정식 오픈(LAUNCHED)한 운영 배포에서만 노출하고, 미리보기·커밍순 상태에서는 노출하지 않습니다.
 */
export const allowIndexing = LAUNCHED && process.env.VERCEL_ENV === "production"
