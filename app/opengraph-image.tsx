import { ImageResponse } from "next/og"

// 링크를 카카오톡·문자·SNS에 붙여넣을 때 보이는 대표 이미지 (글자는 영문만 써서 별도 글꼴 없이 그려요)
export const alt = "ooro."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1eee6",
          color: "#6b4f3a",
        }}
      >
        <div style={{ fontSize: 220, fontWeight: 600, letterSpacing: -6 }}>ooro.</div>
        <div style={{ marginTop: 16, fontSize: 30, letterSpacing: 10, textTransform: "uppercase" }}>premium wellness</div>
      </div>
    ),
    size
  )
}
