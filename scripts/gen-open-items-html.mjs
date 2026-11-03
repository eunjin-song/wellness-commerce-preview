// lib/open-items.ts → 동업자 공유용 웹페이지(HTML 조각).  실행: node scripts/gen-open-items-html.mjs <저장할 경로>
// 웹페이지로 올리는 일은 Claude에게 "확인 목록 갱신해줘"라고 하면 같은 링크로 다시 올려줘요.
import { readFileSync, writeFileSync } from "node:fs"
import { OPEN_ITEMS } from "../lib/open-items.ts"

const out = process.argv[2]
if (!out) {
  console.error("저장할 경로를 알려주세요. 예) node scripts/gen-open-items-html.mjs out.html")
  process.exit(1)
}

const logoSrc = readFileSync(new URL("../components/Logo.tsx", import.meta.url), "utf8")
const logoPath = logoSrc.match(/const PATH =\s*"([^"]+)"/)[1]

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const today = new Date().toLocaleDateString("sv-SE")

const open = OPEN_ITEMS.filter((i) => !i.done)
const done = OPEN_ITEMS.filter((i) => i.done)
const withLeaning = open.filter((i) => i.leaning)
const rest = open.filter((i) => !i.leaning).sort((a, b) => Number(!!b.requested) - Number(!!a.requested))

const pill = (text, solid) => `<span class="pill${solid ? " pill--solid" : ""}">${esc(text)}</span>`

function card(item) {
  const pills = [item.requested ? pill("요청하신 항목", true) : "", item.leaning ? pill("잠정 결정") : ""].join("")
  const table = item.table
    ? `<p class="hint">표는 옆으로 밀어서 전체를 볼 수 있어요.</p>
      <div class="table-wrap" tabindex="0" role="region" aria-label="${esc(item.title)} 비교표">
        <table>
          <thead><tr>${item.table.headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
          <tbody>${item.table.rows
            .map(
              (r, ri) =>
                `<tr${ri === 0 ? ' class="is-pick"' : ""}>${r
                  .map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`))
                  .join("")}</tr>`
            )
            .join("")}</tbody>
        </table>
      </div>
      ${item.table.note ? `<p class="note">${esc(item.table.note)}</p>` : ""}`
    : ""
  const checklist = item.checklist?.length
    ? `<h4>확인할 것</h4><ul class="checks">${item.checklist.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`
    : ""
  const links = item.links?.length
    ? `<h4>참고 자료</h4><ul class="links">${item.links
        .map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a></li>`)
        .join("")}</ul>`
    : ""
  return `<article class="card" id="${esc(item.id)}">
    <header><h3>${esc(item.title)}</h3><div class="pills">${pills}</div></header>
    <p>${esc(item.detail)}</p>
    ${item.leaning ? `<p class="leaning">${esc(item.leaning)}</p>` : ""}
    ${table}${checklist}${links}
    ${item.where ? `<p class="where">임시값 위치 · ${esc(item.where)}</p>` : ""}
  </article>`
}

const overview = [...withLeaning, ...rest]
  .map(
    (i) =>
      `<li><a href="#${esc(i.id)}"><span>${esc(i.title)}</span><span class="pills">${
        i.requested ? pill("요청하신 항목", true) : ""
      }${i.leaning ? pill("잠정 결정") : ""}</span></a></li>`
  )
  .join("")

const html = `<title>오픈 전 확인 목록</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: light;
    --bg: #f1eee6; --surface: #fcfbf8; --ink: #7a6855; --ink-strong: #5e4f40;
    --line: rgba(122, 104, 85, 0.28); --line-soft: rgba(122, 104, 85, 0.14); --pick: rgba(122, 104, 85, 0.08); --on-ink: #fcfbf8;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --bg: #26211c; --surface: #302a24; --ink: #d9c8b2; --ink-strong: #efe5d6;
      --line: rgba(217, 200, 178, 0.32); --line-soft: rgba(217, 200, 178, 0.16); --pick: rgba(217, 200, 178, 0.1); --on-ink: #26211c;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --bg: #26211c; --surface: #302a24; --ink: #d9c8b2; --ink-strong: #efe5d6;
    --line: rgba(217, 200, 178, 0.32); --line-soft: rgba(217, 200, 178, 0.16); --pick: rgba(217, 200, 178, 0.1); --on-ink: #26211c;
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif; font-size: 15px; line-height: 1.7; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 880px; margin: 0 auto; padding-inline: 20px; padding-block: 40px 96px; }
  a { color: inherit; text-underline-offset: 4px; }
  a:focus-visible, .table-wrap:focus-visible { outline: 2px solid var(--ink-strong); outline-offset: 3px; border-radius: 4px; }

  .logo { display: block; width: 104px; height: auto; color: var(--ink-strong); }
  h1 { margin: 36px 0 0; font-size: clamp(28px, 6vw, 38px); line-height: 1.25; font-weight: 500; letter-spacing: -0.01em; color: var(--ink-strong); text-wrap: balance; }
  .meta { margin: 14px 0 0; font-size: 14px; }
  .meta b { font-weight: 700; color: var(--ink-strong); }
  .howto { margin: 28px 0 0; padding: 16px 18px; background: var(--surface); border-radius: 14px; font-size: 14px; max-width: 62ch; }

  h2 { margin: 64px 0 0; padding-bottom: 12px; border-bottom: 1px solid var(--line); font-size: 13px; font-weight: 700; letter-spacing: 0.08em; color: var(--ink-strong); }
  h2 small { font-weight: 400; letter-spacing: 0; margin-left: 6px; }

  .overview { list-style: none; margin: 16px 0 0; padding: 0; }
  .overview li + li { border-top: 1px solid var(--line-soft); }
  .overview a { display: flex; flex-wrap: wrap; gap: 6px 14px; justify-content: space-between; align-items: center; padding: 11px 2px; text-decoration: none; }
  .overview a:hover span:first-child { text-decoration: underline; text-underline-offset: 4px; }

  .pills { display: inline-flex; flex-wrap: wrap; gap: 6px; }
  .pill { display: inline-block; padding: 1px 10px; border: 1px solid var(--line); border-radius: 999px; font-size: 12px; line-height: 1.7; white-space: nowrap; }
  .pill--solid { background: var(--ink); color: var(--on-ink); border-color: var(--ink); }

  .card { margin-top: 20px; padding: 24px 24px 22px; background: var(--surface); border-radius: 18px; scroll-margin-top: 20px; }
  .card header { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: baseline; justify-content: space-between; }
  h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--ink-strong); line-height: 1.45; text-wrap: balance; }
  h4 { margin: 20px 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: var(--ink-strong); }
  .card p { margin: 12px 0 0; max-width: 68ch; }
  .leaning { font-weight: 700; color: var(--ink-strong); }
  .note, .where { font-size: 13px; }
  .where { margin-top: 16px !important; }

  .checks { list-style: none; margin: 0; padding: 0; }
  .checks li { position: relative; padding: 3px 0 3px 28px; max-width: 70ch; }
  .checks li::before { content: ""; position: absolute; left: 2px; top: 9px; width: 14px; height: 14px; border: 1.5px solid var(--ink); border-radius: 4px; }
  .links { margin: 0; padding-left: 18px; }

  .card p.hint { display: none; margin-top: 16px; font-size: 12px; }
  @media (max-width: 900px) { .card p.hint { display: block; } }
  .table-wrap { position: relative; overflow-x: auto; margin-top: 8px; border: 1px solid var(--line-soft); border-radius: 12px; }
  table { width: 100%; min-width: 820px; border-collapse: collapse; font-size: 13px; line-height: 1.6; font-variant-numeric: tabular-nums; }
  th, td { padding: 12px 14px; text-align: left; vertical-align: top; }
  thead th { font-size: 12px; font-weight: 700; color: var(--ink-strong); border-bottom: 1px solid var(--line); white-space: nowrap; }
  tbody tr + tr > * { border-top: 1px solid var(--line-soft); }
  tbody th { font-weight: 700; color: var(--ink-strong); white-space: nowrap; }
  tr.is-pick > * { background: var(--pick); }

  .decided { list-style: none; margin: 16px 0 0; padding: 0; }
  .decided li { padding: 14px 0; border-top: 1px solid var(--line-soft); max-width: 72ch; }
  .decided li:first-child { border-top: 0; }
  .decided b { display: block; color: var(--ink-strong); }
  .foot { margin-top: 72px; font-size: 13px; }

  @media (max-width: 520px) { .card { padding: 20px 18px; border-radius: 16px; } }
</style>

<div class="wrap">
  <svg class="logo" viewBox="0 0 1728 397" role="img" aria-label="ooro." fill="currentColor"><path fill-rule="evenodd" d="${logoPath}"/></svg>

  <h1>오픈 전 확인 목록</h1>
  <p class="meta">${today} 기준 · 확인 필요 <b>${open.length}</b>개 · 결정 완료 <b>${done.length}</b>개</p>
  <p class="howto">정식 오픈 전에 정해야 하는 것들을 한곳에 모았어요. 항목마다 의견이 있으면 이 페이지에 댓글로 남겨 주세요. 가격과 한도는 검색해서 확인한 값이라 가입 전에 공식 페이지에서 다시 확인해야 해요.</p>

  <h2>한눈에 보기</h2>
  <ol class="overview" style="list-style:none">${overview}</ol>

  ${
    withLeaning.length
      ? `<h2>동업자와 먼저 확인할 것 <small>잠정 결정을 확정해 주세요</small></h2>${withLeaning.map(card).join("")}`
      : ""
  }

  <h2>정해야 할 것 <small>${rest.length}개</small></h2>
  ${rest.map(card).join("")}

  <h2>결정 완료 <small>${done.length}개</small></h2>
  <ul class="decided">${done.map((i) => `<li><b>${esc(i.title)}</b>${esc(i.decision ?? "완료")}</li>`).join("")}</ul>

  <p class="foot">원본은 GitHub 저장소의 OPEN_ITEMS.md와 관리자 대시보드에 있어요. 내용이 바뀌면 이 페이지도 새로 만들어 드려요.</p>
</div>
`

writeFileSync(out, html, "utf8")
console.log("ok", html.length)
