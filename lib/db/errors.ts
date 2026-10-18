/** 서버·로그인 에러를 고객이 이해할 수 있는 한국어로 바꿉니다. */
export function toKoreanError(error: unknown, fallback = "잠시 후 다시 시도해 주세요."): string {
  const raw =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : ""
  const message = raw.trim()
  if (!message) return fallback

  // 주문 함수(place_order)가 보내는 코드
  if (message.startsWith("out_of_stock:")) return `'${message.slice("out_of_stock:".length)}' 상품의 재고가 부족해요. 수량을 줄이거나 장바구니에서 빼주세요.`
  if (message.startsWith("invalid_option:")) return `'${message.slice("invalid_option:".length)}' 상품의 옵션을 다시 선택해 주세요.`
  const known: Record<string, string> = {
    not_configured: "서버가 아직 연결되지 않았어요.",
    not_authenticated: "로그인이 필요해요. 다시 로그인해 주세요.",
    empty_cart: "주문할 상품이 없어요.",
    too_many_items: "한 번에 주문할 수 있는 상품 수를 넘었어요.",
    invalid_address: "배송지 정보를 다시 확인해 주세요.",
    invalid_quantity: "수량이 올바르지 않아요.",
    product_unavailable: "판매가 종료되었거나 없는 상품이 있어요. 장바구니를 확인해 주세요.",
  }
  if (known[message]) return known[message]

  // 로그인·가입 (Supabase Auth)
  if (/invalid login credentials/i.test(message)) return "이메일 또는 비밀번호가 맞지 않아요."
  if (/email not confirmed/i.test(message)) return "이메일 인증이 아직 안 됐어요. 받은 메일함에서 인증 링크를 눌러 주세요."
  if (/user already registered|already been registered/i.test(message)) return "이미 가입된 이메일이에요."
  if (/password should be at least|weak password/i.test(message)) return "비밀번호가 너무 약해요. 영문과 숫자를 섞어 8자 이상으로 만들어 주세요."
  if (/same password|different from the old password/i.test(message)) return "현재 비밀번호와 다른 비밀번호를 입력해 주세요."
  if (/rate limit|only request this after|too many requests/i.test(message)) return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요."
  if (/session.*missing|not authenticated|jwt/i.test(message)) return "로그인 정보가 만료됐어요. 다시 로그인해 주세요."
  if (/failed to fetch|networkerror|network request failed/i.test(message)) return "인터넷 연결을 확인하고 다시 시도해 주세요."

  // 권한 (RLS)
  if (/row-level security|permission denied/i.test(message)) return "권한이 없어서 처리할 수 없어요."
  if (/duplicate key|unique/i.test(message)) return "이미 처리된 요청이에요."

  return fallback
}
