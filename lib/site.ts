// 정식 오픈할 때 true로 바꾸고 push하면 www.ooro.store에 전체 사이트가 공개됩니다.
export const LAUNCHED = false

// Vercel의 production 배포에서만 커밍순 페이지를 보여줍니다.
// 로컬(npm run dev)과 Vercel preview 배포에서는 전체 사이트가 그대로 보입니다.
export const isComingSoon = !LAUNCHED && process.env.VERCEL_ENV === "production"
