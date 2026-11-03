// docs/implementation-status.ts → 공유용 웹페이지(HTML 조각).  실행: node scripts/gen-implementation-html.mjs <저장할 경로>
// 웹페이지로 올리는 일은 Claude에게 "체크리스트 갱신해줘"라고 하면 같은 링크로 다시 올려줘요.
import { readFileSync, writeFileSync } from "node:fs"
import { GROUPS, LAST_UPDATED, NEXT_STEPS, OVERVIEW, RESUME_STEPS, STATUS_LABEL } from "../docs/implementation-status.ts"

const out = process.argv[2]
if (!out) {
  console.error("저장할 경로를 알려주세요. 예) node scripts/gen-implementation-html.mjs out.html")
  process.exit(1)
}

const logoSrc = readFileSync(new URL("../components/Logo.tsx", import.meta.url), "utf8")
const logoPath = logoSrc.match(/const PATH =\s*"([^"]+)"/)[1]

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const ICON = { done: "●", test: "◐", temp: "◌", todo: "○" }
const ORDER = ["done", "test", "temp", "todo"]

const all = GROUPS.flatMap((g) => g.items)
const count = (s) => all.filter((i) => i.status === s).length

const pill = (status) => `<span class="pill pill--${status}"><span aria-hidden="true">${ICON[status]}</span> ${STATUS_LABEL[status]}</span>`

const tiles = ORDER.map(
  (s) => `<button type="button" class="tile tile--${s}" data-filter="${s}" aria-pressed="false">
    <span class="tile-num">${count(s)}</span>
    <span class="tile-label">${pill(s)}</span>
  </button>`
).join("")

const groups = GROUPS.map((g) => {
  const n = (s) => g.items.filter((i) => i.status === s).length
  const summary = ORDER.filter((s) => n(s) > 0)
    .map((s) => `${STATUS_LABEL[s]} ${n(s)}`)
    .join(" · ")
  const rows = g.items
    .map(
      (i) => `<li class="row" data-status="${i.status}">
        <div class="row-head"><h4>${esc(i.title)}</h4>${pill(i.status)}</div>
        <p class="note">${esc(i.note)}</p>
        ${i.where ? `<p class="where">${esc(i.where)}</p>` : ""}
      </li>`
    )
    .join("")
  return `<section class="group" id="${esc(g.id)}" aria-labelledby="h-${esc(g.id)}">
    <div class="group-head"><h3 id="h-${esc(g.id)}">${esc(g.title)}</h3><p class="group-sum">${summary}</p></div>
    <ul class="rows">${rows}</ul>
  </section>`
}).join("")

const nav = GROUPS.map((g) => `<li><a href="#${esc(g.id)}">${esc(g.title)}</a></li>`).join("")

const html = `<title>ooro. 구현 현황</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: light;
    --bg: #f1eee6;
    --surface: #fcfbf8;
    --ink: #7a6855;
    --ink-strong: #5e4f40;
    --line: rgba(122, 104, 85, 0.3);
    --line-soft: rgba(122, 104, 85, 0.15);
    --on-ink: #fcfbf8;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --bg: #26211c; --surface: #302a24; --ink: #d9c8b2; --ink-strong: #efe5d6;
      --line: rgba(217, 200, 178, 0.38); --line-soft: rgba(217, 200, 178, 0.18); --on-ink: #26211c;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --bg: #26211c; --surface: #302a24; --ink: #d9c8b2; --ink-strong: #efe5d6;
    --line: rgba(217, 200, 178, 0.38); --line-soft: rgba(217, 200, 178, 0.18); --on-ink: #26211c;
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif; font-size: 15px; line-height: 1.7; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 900px; margin: 0 auto; padding-inline: 20px; padding-block: 40px 96px; }
  a { color: inherit; text-underline-offset: 4px; }
  a:focus-visible, button:focus-visible { outline: 2px solid var(--ink-strong); outline-offset: 3px; border-radius: 6px; }

  .logo { display: block; width: 104px; height: auto; color: var(--ink-strong); }
  h1 { margin: 36px 0 0; font-size: clamp(28px, 6vw, 38px); line-height: 1.25; font-weight: 500; letter-spacing: -0.01em; color: var(--ink-strong); text-wrap: balance; }
  .meta { margin: 12px 0 0; font-size: 14px; }

  h2 { margin: 56px 0 0; padding-bottom: 12px; border-bottom: 1px solid var(--line); font-size: 13px; font-weight: 700; letter-spacing: 0.08em; color: var(--ink-strong); }

  .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 20px 0 0; padding: 0; }
  .tile { all: unset; box-sizing: border-box; cursor: pointer; display: flex; flex-direction: column; gap: 6px; padding: 16px 18px; background: var(--surface); border-radius: 16px; border: 1.5px solid transparent; }
  .tile:hover { border-color: var(--line); }
  .tile[aria-pressed="true"] { border-color: var(--ink-strong); }
  .tile:focus-visible { outline: 2px solid var(--ink-strong); outline-offset: 3px; }
  .tile-num { font-size: 34px; line-height: 1.1; font-weight: 500; color: var(--ink-strong); font-variant-numeric: tabular-nums; }
  .filter-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 14px; min-height: 28px; font-size: 13px; }
  .filter-bar button { all: unset; cursor: pointer; text-decoration: underline; text-underline-offset: 4px; }
  .filter-bar button:focus-visible { outline: 2px solid var(--ink-strong); outline-offset: 3px; }

  .pill { display: inline-flex; align-items: center; gap: 5px; padding: 1px 11px; border-radius: 999px; font-size: 12px; line-height: 1.7; white-space: nowrap; border: 1.5px solid var(--ink); color: var(--ink-strong); background: transparent; }
  .pill--done { background: var(--ink); color: var(--on-ink); }
  .pill--temp { border-style: dashed; }
  .pill--todo { border-style: dotted; border-width: 2px; }

  .overview { margin: 20px 0 0; padding: 0; list-style: none; }
  .overview li { display: grid; grid-template-columns: 8.5em 1fr; gap: 4px 16px; padding: 12px 0; border-top: 1px solid var(--line-soft); }
  .overview li:first-child { border-top: 0; }
  .overview b { color: var(--ink-strong); }
  .legend { margin: 18px 0 0; padding: 16px 18px; background: var(--surface); border-radius: 14px; font-size: 13px; }
  .legend p { margin: 0; display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
  .legend p + p { margin-top: 8px; }

  ol.steps { margin: 16px 0 0; padding-left: 22px; }
  ol.steps li { padding: 3px 0 3px 4px; max-width: 74ch; }
  ol.steps li::marker { color: var(--ink-strong); font-weight: 700; }

  .toc { display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 18px 0 0; padding: 0; list-style: none; font-size: 14px; }

  .group { margin-top: 44px; scroll-margin-top: 16px; }
  .group-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px; }
  h3 { margin: 0; font-size: 20px; font-weight: 700; color: var(--ink-strong); line-height: 1.4; }
  .group-sum { margin: 0; font-size: 13px; }
  .rows { margin: 14px 0 0; padding: 0; list-style: none; border-top: 1px solid var(--line); }
  .row { padding: 16px 2px; border-bottom: 1px solid var(--line-soft); }
  .row-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 14px; }
  h4 { margin: 0; font-size: 15px; font-weight: 700; color: var(--ink-strong); line-height: 1.5; }
  .note { margin: 6px 0 0; max-width: 72ch; }
  .where { margin: 6px 0 0; font-size: 12.5px; font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; word-break: break-word; }
  .where::before { content: "위치 · "; font-family: "Noto Sans KR", system-ui, sans-serif; }

  [hidden] { display: none !important; }
  .foot { margin-top: 64px; font-size: 13px; }
  @media (max-width: 560px) { .overview li { grid-template-columns: 1fr; } }
</style>

<div class="wrap">
  <svg class="logo" viewBox="0 0 1728 397" role="img" aria-label="ooro." fill="currentColor"><path fill-rule="evenodd" d="${logoPath}"/></svg>
  <h1>구현 현황 체크리스트</h1>
  <p class="meta">마지막 갱신 ${esc(LAST_UPDATED)} · 전체 ${all.length}개 항목</p>

  <h2>한눈에 보기</h2>
  <div class="tiles" role="group" aria-label="상태별로 걸러 보기">${tiles}</div>
  <div class="filter-bar" aria-live="polite"><span id="filter-msg">숫자를 누르면 그 상태의 항목만 볼 수 있어요.</span><button type="button" id="filter-reset" hidden>전체 보기</button></div>

  <ul class="overview">${OVERVIEW.map((o) => `<li><b>${esc(o.label)}</b><span>${esc(o.value)}</span></li>`).join("")}</ul>

  <div class="legend">
    <p>${pill("done")} 만들고 직접 확인까지 했어요 (서버와 무관하거나, DB 시험으로 확인)</p>
    <p>${pill("test")} 만들었지만 실제 서버에 연결해서는 아직 확인하지 못했어요</p>
    <p>${pill("temp")} 화면은 있지만 샘플 내용이에요</p>
    <p>${pill("todo")} 아직 만들지 않았어요</p>
  </div>

  <h2>이어서 작업할 때</h2>
  <ol class="steps">${RESUME_STEPS.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>

  <h2>다음에 할 일 <span style="font-weight:400;letter-spacing:0">(추천 순서)</span></h2>
  <ol class="steps">${NEXT_STEPS.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>

  <h2>기능별 현황</h2>
  <ul class="toc">${nav}</ul>
  ${groups}

  <p class="foot">원본은 GitHub 저장소의 docs/implementation-status.ts 이고, IMPLEMENTATION.md 로도 정리돼 있어요. 기능이 바뀔 때마다 갱신해요.</p>
</div>

<script>
  (function () {
    var LABEL = ${JSON.stringify(STATUS_LABEL)};
    var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile"));
    var rows = Array.prototype.slice.call(document.querySelectorAll(".row"));
    var groups = Array.prototype.slice.call(document.querySelectorAll(".group"));
    var msg = document.getElementById("filter-msg");
    var reset = document.getElementById("filter-reset");
    var current = null;

    function apply(status) {
      current = status;
      var shown = 0;
      rows.forEach(function (r) {
        var on = !status || r.getAttribute("data-status") === status;
        r.hidden = !on;
        if (on) shown++;
      });
      groups.forEach(function (g) {
        g.hidden = !g.querySelector(".row:not([hidden])");
      });
      tiles.forEach(function (t) {
        t.setAttribute("aria-pressed", String(t.getAttribute("data-filter") === status));
      });
      msg.textContent = status ? "'" + LABEL[status] + "' 항목 " + shown + "개만 보고 있어요." : "숫자를 누르면 그 상태의 항목만 볼 수 있어요.";
      reset.hidden = !status;
    }

    tiles.forEach(function (t) {
      t.addEventListener("click", function () {
        var s = t.getAttribute("data-filter");
        apply(current === s ? null : s);
      });
    });
    reset.addEventListener("click", function () { apply(null); });
  })();
</script>
`

writeFileSync(out, html, "utf8")
console.log("ok", html.length)
