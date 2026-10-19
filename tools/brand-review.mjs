/**
 * Owner's review page for the brand proposals, laid out the way the web shop
 * will group products later: by category, then by brand inside it.
 *
 *   node tools/brand-review.mjs <snapshot.json> <de-xuat-tung-sp.csv> [out.html]
 *   → review/thuong-hieu.html
 *
 * Thumbnails load from the image URLs KiotViet holds, so the page needs a network.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { ROOT, escapeHtml, parseCsv } from "./lib.mjs";

const [snapshotPath, proposalsPath, outArg] = process.argv.slice(2);
if (!snapshotPath || !proposalsPath) {
  console.error("usage: node tools/brand-review.mjs <snapshot.json> <de-xuat-tung-sp.csv> [out.html]");
  process.exit(2);
}
const out = outArg ?? join(ROOT, "review", "thuong-hieu.html");
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const rows = parseCsv(await readFile(proposalsPath, "utf8"));
const image = new Map(snapshot.products.map((p) => [String(p.id), p.images?.[0] ?? null]));

const LABEL = {
  CHAC: "chắc",
  KIEM: "cần xem",
  HOI: "mâu thuẫn",
  GIU_CHUA_KIEM: "giữ, chưa kiểm",
  XEM_ANH: "chưa biết",
  TRONG: "không nhãn",
};

const byCategory = new Map();
for (const r of rows) {
  if (!byCategory.has(r.category)) byCategory.set(r.category, []);
  byCategory.get(r.category).push(r);
}
const categories = [...byCategory].sort((a, b) => a[0].localeCompare(b[0], "vi"));

const card = (r) => {
  const src = image.get(r.kiotProductId);
  const changed = r.current !== r.proposed;
  return `<li class="p${changed ? " chg" : ""}${r.confidence === "CHAC" ? "" : " look"}${r.active === "ngừng" ? " off" : ""}" data-q="${escapeHtml(
    `${r.name} ${r.code} ${r.current} ${r.proposed} ${r.note}`.toLowerCase(),
  )}">
  ${src ? `<img loading="lazy" src="${escapeHtml(src)}" alt="">` : `<span class="noimg">không ảnh</span>`}
  <div><b>${escapeHtml(r.name)}</b>
  <small>${escapeHtml(r.code)} · #${escapeHtml(r.kiotProductId)}${r.active === "ngừng" ? " · ngừng bán" : ""}</small>
  <span class="br">${changed ? `<s>${escapeHtml(r.current || "(trống)")}</s> → ` : ""}<em>${escapeHtml(r.proposed || "(trống)")}</em>
  <i class="c ${r.confidence}">${LABEL[r.confidence] ?? r.confidence}</i></span>
  ${r.note ? `<small class="note">${escapeHtml(r.note)}</small>` : ""}
  ${r.brandLine && r.confidence !== "CHAC" ? `<small class="note">Mô tả: ${escapeHtml(r.brandLine)}</small>` : ""}</div></li>`;
};

const section = ([name, list]) => {
  const groups = new Map();
  for (const r of list) {
    const k = r.proposed || "";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  const ordered = [...groups].sort((a, b) => (a[0] === "") - (b[0] === "") || b[1].length - a[1].length || a[0].localeCompare(b[0], "vi"));
  return `<section><h2>${escapeHtml(name || "(chưa có danh mục)")} <small>${list.length} SP · ${groups.size} nhãn</small></h2>
${ordered
  .map(
    ([brand, items]) => `<div class="g"><h3>${escapeHtml(brand || "Không nhãn / chưa biết")} <small>${items.length}</small></h3><ul>${items
      .sort((a, b) => a.name.localeCompare(b.name, "vi"))
      .map(card)
      .join("")}</ul></div>`,
  )
  .join("\n")}</section>`;
};

const count = (f) => rows.filter(f).length;
const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Duyệt thương hiệu</title>
<style>
:root{--bg:#fff;--fg:#1d1d1f;--muted:#6b6b70;--line:#e4e4e7;--card:#fafafa;--red:#ef2c28;--ok:#1a7f37;--warn:#b45309;--bad:#b91c1c}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141416;--fg:#ececf0;--muted:#a0a0a8;--line:#2c2c31;--card:#1c1c20;--ok:#4ade80;--warn:#fbbf24;--bad:#f87171}}
:root[data-theme="dark"]{--bg:#141416;--fg:#ececf0;--muted:#a0a0a8;--line:#2c2c31;--card:#1c1c20;--ok:#4ade80;--warn:#fbbf24;--bad:#f87171}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif}
header.top{position:sticky;top:0;z-index:2;background:var(--bg);border-bottom:3px solid var(--red);padding:12px 16px}
h1{margin:0 0 6px;font-size:20px}.stats{color:var(--muted);font-size:13px}
.bar{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.bar button,.bar input{font:inherit;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg)}
.bar button[aria-pressed="true"]{background:var(--red);border-color:var(--red);color:#fff}.bar input{flex:1;min-width:160px}
main{padding:0 16px 40px;max-width:1100px;margin:auto}section{margin-top:24px}h2{font-size:18px;border-bottom:1px solid var(--line);padding-bottom:4px}
h2 small,h3 small{color:var(--muted);font-weight:400}h3{font-size:15px;margin:14px 0 6px;color:var(--red)}
ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px}
li.p{display:flex;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px}
li.p img,.noimg{width:64px;height:64px;object-fit:contain;flex:none;background:#fff;border-radius:6px}.noimg{display:grid;place-items:center;font-size:11px;color:#888}
li.p div{min-width:0;display:flex;flex-direction:column;gap:2px}li.p b{font-size:14px;overflow-wrap:anywhere}small{color:var(--muted);font-size:12px}
.br s{color:var(--muted)}.br em{font-style:normal;font-weight:600}.c{font-style:normal;font-size:11px;margin-left:6px;padding:1px 6px;border-radius:99px;border:1px solid currentColor}
.c.CHAC{color:var(--ok)}.c.KIEM,.c.GIU_CHUA_KIEM{color:var(--warn)}.c.HOI,.c.XEM_ANH{color:var(--bad)}.c.TRONG{color:var(--muted)}
.note{overflow-wrap:anywhere}li.off{opacity:.7}.hide{display:none!important}
</style></head><body>
<header class="top"><h1>Duyệt thương hiệu — ${count(() => true)} SP</h1>
<div class="stats">Bản chụp ${escapeHtml(snapshot.takenAt)} · đổi ${count((r) => r.current !== r.proposed)} · cần xem (không phải "chắc") ${count((r) => r.confidence !== "CHAC")}. Chỉ là đề xuất, chưa ghi lên KiotViet.</div>
<div class="bar"><button data-f="all" aria-pressed="true">Tất cả</button><button data-f="chg" aria-pressed="false">Chỉ SP đổi</button><button data-f="look" aria-pressed="false">Chỉ SP cần xem</button><input type="search" placeholder="Tìm tên, mã, thương hiệu…"></div></header>
<main>
${categories.map(section).join("\n")}
</main>
<script>
const items=[...document.querySelectorAll("li.p")];let mode="all";const q=document.querySelector("input");
function apply(){const t=q.value.trim().toLowerCase();for(const li of items){const ok=(mode==="all"||li.classList.contains(mode))&&(!t||li.dataset.q.includes(t));li.classList.toggle("hide",!ok)}
for(const g of document.querySelectorAll(".g"))g.classList.toggle("hide",!g.querySelector("li.p:not(.hide)"));for(const s of document.querySelectorAll("section"))s.classList.toggle("hide",!s.querySelector("li.p:not(.hide)"))}
for(const b of document.querySelectorAll(".bar button"))b.onclick=()=>{mode=b.dataset.f;for(const x of document.querySelectorAll(".bar button"))x.setAttribute("aria-pressed",x===b);apply()};q.oninput=apply;
</script></body></html>
`;
await writeFile(out, html);
console.log(`${rows.length} products, ${categories.length} categories -> ${out}`);
