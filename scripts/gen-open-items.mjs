// lib/open-items.ts → OPEN_ITEMS.md 로 정리합니다.  실행: npm run open-items
import { writeFileSync } from "node:fs"
import { OPEN_ITEMS } from "../lib/open-items.ts"

const open = OPEN_ITEMS.filter((i) => !i.done)
const done = OPEN_ITEMS.filter((i) => i.done)

const lines = [
  "# 정식 오픈 전 확인 목록",
  "",
  "> 이 파일은 `lib/open-items.ts`에서 자동으로 만들어져요. 직접 고치지 말고 그 파일을 고친 뒤 `npm run open-items`를 실행하세요.",
  "> 같은 내용이 관리자 대시보드(`/admin`) 하단에도 표시돼요.",
  "",
  `## 확인 필요 (${open.length})`,
  "",
]

for (const item of open) {
  lines.push(`### ${item.title}${item.requested ? "  ·  요청하신 항목" : ""}`, "", item.detail, "")
  if (item.checklist?.length) {
    lines.push("확인할 것", ...item.checklist.map((c) => `- [ ] ${c}`), "")
  }
  if (item.links?.length) {
    lines.push("참고 자료", ...item.links.map((l) => `- [${l.label}](${l.url})`), "")
  }
  if (item.where) lines.push(`임시값 위치: \`${item.where}\``, "")
}

lines.push(`## 결정 완료 (${done.length})`, "")
for (const item of done) {
  lines.push(`- **${item.title}**: ${item.decision ?? "완료"}`)
}
lines.push("")

writeFileSync(new URL("../OPEN_ITEMS.md", import.meta.url), lines.join("\n"), "utf8")
console.log(`OPEN_ITEMS.md 생성: 확인 필요 ${open.length}개, 결정 완료 ${done.length}개`)
