// docs/implementation-status.ts → IMPLEMENTATION.md 로 정리합니다.  실행: npm run implementation
import { writeFileSync } from "node:fs"
import { GROUPS, LAST_UPDATED, NEXT_STEPS, OVERVIEW, RESUME_STEPS, STATUS_LABEL } from "../docs/implementation-status.ts"

const all = GROUPS.flatMap((g) => g.items)
const count = (status) => all.filter((i) => i.status === status).length
const cell = (text) => String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " ")

const lines = [
  "# ooro. 구현 현황 체크리스트",
  "",
  "> 이 파일은 `docs/implementation-status.ts`에서 자동으로 만들어져요. 직접 고치지 말고 그 파일을 고친 뒤 `npm run implementation`을 실행하세요.",
  "",
  `마지막 갱신: ${LAST_UPDATED}`,
  "",
  "## 한눈에 보기",
  "",
  `전체 ${all.length}개 · **완료 ${count("done")}** · **시험 필요 ${count("test")}** · **임시 ${count("temp")}** · **미구현 ${count("todo")}**`,
  "",
  ...OVERVIEW.map((o) => `- **${o.label}**: ${o.value}`),
  "",
  "상태 기준",
  `- **${STATUS_LABEL.done}**: 만들고 직접 확인까지 했어요 (서버 연결과 무관하거나, DB 시험으로 확인한 것)`,
  `- **${STATUS_LABEL.test}**: 만들었지만 실제 Supabase 서버에 연결해서는 아직 확인하지 못했어요`,
  `- **${STATUS_LABEL.temp}**: 화면은 있지만 샘플 내용이에요`,
  `- **${STATUS_LABEL.todo}**: 아직 만들지 않았어요`,
  "",
  "## 이어서 작업할 때",
  "",
  ...RESUME_STEPS.map((s, i) => `${i + 1}. ${s}`),
  "",
  "## 다음에 할 일 (추천 순서)",
  "",
  ...NEXT_STEPS.map((s, i) => `${i + 1}. ${s}`),
  "",
]

for (const group of GROUPS) {
  const n = (s) => group.items.filter((i) => i.status === s).length
  lines.push(
    `## ${group.title}`,
    "",
    `완료 ${n("done")} · 시험 필요 ${n("test")} · 임시 ${n("temp")} · 미구현 ${n("todo")}`,
    "",
    "| 기능 | 상태 | 비고 | 위치 |",
    "| --- | --- | --- | --- |",
    ...group.items.map((i) => `| ${cell(i.title)} | ${STATUS_LABEL[i.status]} | ${cell(i.note)} | ${i.where ? `\`${cell(i.where)}\`` : ""} |`),
    ""
  )
}

writeFileSync(new URL("../IMPLEMENTATION.md", import.meta.url), lines.join("\n"), "utf8")
console.log(`IMPLEMENTATION.md 생성: 전체 ${all.length}개 (완료 ${count("done")}, 시험 필요 ${count("test")}, 임시 ${count("temp")}, 미구현 ${count("todo")})`)
