/**
 * Build the owner's review page for one category: current vs new, side by side.
 *
 *   node tools/review-page.mjs <category-dir | kiotCategoryId>
 *   → review/<category-dir>.html   (open it from a clone of this repo)
 *
 * Current images load from the KiotViet CDN URL in meta.json; new ones are
 * embedded from the image.webp next to it, so the page still shows them when
 * the HTML file is downloaded and opened on its own.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { ROOT, escapeHtml, loadAllProducts } from "./lib.mjs";

const arg = process.argv[2];
if (!arg) {
  console.error("usage: node tools/review-page.mjs <category-dir | kiotCategoryId>");
  process.exit(2);
}
const products = (await loadAllProducts()).filter(
  (p) => p.categoryDir === arg || p.categoryDir.startsWith(`${arg}-`),
);
if (!products.length) {
  console.error(`no products in category ${arg}`);
  process.exit(1);
}
const categoryDir = products[0].categoryDir;
const reviewDir = join(ROOT, "review");

const LABEL = {
  TODO: "Chưa xem",
  NO_CHANGE: "Giữ nguyên",
  ASK_OWNER: "Hỏi chủ",
  IN_PROGRESS: "Đang làm",
  NEEDS_PHOTO: "Cần chụp",
  READY: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  UPLOADED: "Đã lên web",
};
// Owner's attention first: what waits on them, then what is still moving.
const ORDER = ["READY", "ASK_OWNER", "NEEDS_PHOTO", "IN_PROGRESS", "TODO", "APPROVED", "UPLOADED", "NO_CHANGE"];
products.sort(
  (a, b) => ORDER.indexOf(a.meta.status) - ORDER.indexOf(b.meta.status) || (b.meta.revenue90d ?? 0) - (a.meta.revenue90d ?? 0),
);

const cards = [];
for (const p of products) {
  const m = p.meta;
  const newImage = existsSync(join(p.path, "image.webp"))
    ? `data:image/webp;base64,${(await readFile(join(p.path, "image.webp"))).toString("base64")}`
    : null;
  const newText = existsSync(join(p.path, "description.md"))
    ? await readFile(join(p.path, "description.md"), "utf8")
    : null;
  const img = (src, alt) =>
    src ? `<img loading="lazy" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">` : `<div class="none">Không có ảnh</div>`;
  cards.push(`<article class="card s-${m.status}" data-status="${m.status}">
  <header><b>${escapeHtml(m.name)}</b><small>${escapeHtml(m.code ?? "")} · ${escapeHtml(m.kiotProductId)}</small>
  <span class="tag">${LABEL[m.status] ?? m.status}</span></header>
  <div class="pair">
    <figure>${img(m.current?.imageUrl, "Ảnh hiện tại")}<figcaption>Hiện tại</figcaption></figure>
    <figure>${newImage ? img(newImage, "Ảnh mới") : `<div class="none">—</div>`}<figcaption>Mới · ${escapeHtml(m.image?.decision ?? "")}</figcaption></figure>
  </div>
  ${m.image?.reason ? `<p class="why">Ảnh: ${escapeHtml(m.image.reason)}</p>` : ""}
  ${m.image?.source?.url ? `<p class="why">Nguồn: <a href="${escapeHtml(m.image.source.url)}" rel="noreferrer noopener" target="_blank">${escapeHtml(new URL(m.image.source.url).hostname)}</a></p>` : ""}
  <details${newText ? " open" : ""}><summary>Mô tả · ${escapeHtml(m.description?.decision ?? "")}${m.description?.reason ? ` — ${escapeHtml(m.description.reason)}` : ""}</summary>
    <div class="texts"><div><h4>Hiện tại</h4><pre>${escapeHtml(m.current?.description ?? "(trống)")}</pre></div>
    ${newText ? `<div><h4>Mới</h4><pre>${escapeHtml(newText)}</pre></div>` : ""}</div>
  </details>
  ${m.question ? `<p class="ask">❓ ${escapeHtml(m.question)}</p>` : ""}
</article>`);
}

const counts = Object.fromEntries(ORDER.map((s) => [s, products.filter((p) => p.meta.status === s).length]));
const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Duyệt ${escapeHtml(products[0].meta.category?.name ?? categoryDir)}</title><style>
:root{--bg:#f5f5f5;--card:#fff;--text:#1a1a1a;--muted:#666;--line:#ddd;--red:#ef2c28;--amber:#b7791f;--green:#2f855a;--blue:#2b6cb0}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--card:#1f1f1f;--text:#eee;--muted:#aaa;--line:#333}}
body{margin:0;padding:16px;font:14px/1.45 system-ui,sans-serif;background:var(--bg);color:var(--text)}
h1{font-size:18px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 12px}
nav button{border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:999px;padding:6px 12px;margin:0 6px 6px 0;cursor:pointer}
nav button.on{background:var(--text);color:var(--bg)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:12px}
.card{background:var(--card);border-radius:10px;padding:12px;border-top:4px solid var(--line)}
.s-READY{border-color:var(--blue)}.s-ASK_OWNER{border-color:var(--amber)}.s-NEEDS_PHOTO{border-color:var(--red)}.s-NO_CHANGE,.s-APPROVED,.s-UPLOADED{border-color:var(--green)}
.card header{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:baseline}.card header small{color:var(--muted)}
.tag{margin-left:auto;font-size:12px;font-weight:600}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
figure{margin:0}figcaption{font-size:12px;color:var(--muted);text-align:center}
.pair img,.none{width:100%;aspect-ratio:1;object-fit:contain;background:#fff;border:1px solid var(--line);border-radius:6px}
.none{display:flex;align-items:center;justify-content:center;color:#888;font-size:12px}
.why{margin:2px 0;color:var(--muted);font-size:13px}.ask{margin:6px 0 0;color:var(--amber);font-weight:600}
.texts{display:grid;gap:8px}h4{margin:6px 0 2px;font-size:12px;color:var(--muted)}
pre{white-space:pre-wrap;font:inherit;margin:0;padding:8px;border:1px solid var(--line);border-radius:6px}
summary{cursor:pointer}
</style></head><body>
<h1>${escapeHtml(products[0].meta.category?.path ?? products[0].meta.category?.name ?? categoryDir)}</h1>
<p class="sub">${products.length} SP · trái là ảnh đang trên web, phải là ảnh mới (chưa đưa lên đâu cả)</p>
<nav><button data-f="all" class="on">Tất cả</button>${ORDER.filter((s) => counts[s])
  .map((s) => `<button data-f="${s}">${LABEL[s]} (${counts[s]})</button>`)
  .join("")}</nav>
<div class="grid">${cards.join("\n")}</div>
<script>
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("on",x===b));
  document.querySelectorAll(".card").forEach(c=>{c.style.display=b.dataset.f==="all"||c.dataset.status===b.dataset.f?"":"none"});
});
</script></body></html>`;
const out = join(reviewDir, `${categoryDir}.html`);
await writeFile(out, html);
console.log(`wrote ${relative(ROOT, out)} (${products.length} products)`);
