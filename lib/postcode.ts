/**
 * 카카오(다음) 우편번호 서비스. 무료이고 API 키가 필요 없습니다.
 * 이용 시 검색창 하단의 "Powered by kakao" 표시를 가리면 안 됩니다.
 */
interface PostcodeResult {
  zonecode: string
  roadAddress: string
  jibunAddress: string
  userSelectedType: "R" | "J"
  buildingName: string
  apartment: "Y" | "N"
}

interface PostcodeInstance {
  embed: (element: HTMLElement) => void
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: PostcodeResult) => void
        width?: string
        height?: string
      }) => PostcodeInstance
    }
  }
}

const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"

export function loadPostcode(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("주소 검색 스크립트를 불러오지 못했어요."))
    document.head.appendChild(script)
  })
}

export function openPostcodeEmbed(
  element: HTMLElement,
  onSelect: (result: { zip: string; address: string }) => void
) {
  if (!window.daum) throw new Error("주소 검색이 준비되지 않았어요.")
  new window.daum.Postcode({
    width: "100%",
    height: "100%",
    oncomplete: (data) => {
      let address = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress
      if (data.userSelectedType === "R" && data.apartment === "Y" && data.buildingName) {
        address += ` (${data.buildingName})`
      }
      onSelect({ zip: data.zonecode, address })
    },
  }).embed(element)
}
