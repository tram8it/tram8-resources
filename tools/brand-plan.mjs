/**
 * Turn approved brand proposals into ordered Chrome batches: a plan.csv that
 * brand-diff.mjs checks and a prompt for Claude in Chrome, per batch.
 *
 *   node tools/brand-plan.mjs <fresh-snapshot.json> <de-xuat-tung-sp.csv>
 *        [--include CHAC,KIEM] [--batch 25] [--out-dir work/brand-plan/<stamp>]
 *
 * Only rows whose `confidence` is listed in --include (default CHAC) are
 * planned; HOI / XEM_ANH / GIU_CHUA_KIEM never are until a person settles them.
 * The snapshot must be fresh: a product whose brand differs from the CSV's
 * `current` was changed by someone after the proposal and is left out.
 *
 * Phases, in this order (docs: reports/thuong-hieu/KE-HOACH.md §3 bước 4):
 *   1 gop     move products of a brand that blocks a rename into the survivor
 *   2 xoa-cu  delete those emptied brands (KiotViet must not hold two equal names)
 *   3 doi-ten rename survivors to the canonical spelling — one op moves many products
 *   4 tao     create canonical brands KiotViet does not have
 *   5 gan     per-product changes, one target brand per batch, products on sale first
 *   6 xoa     delete brands left with no product (on sale or not)
 * Phase 6 is planned from the snapshot taken after phase 5, not from this run.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { ROOT, parseCsv, toCsv } from "./lib.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 ? args.splice(at, 2)[1] : fallback;
};
const include = new Set(flag("--include", "CHAC").split(","));
const batchSize = Number(flag("--batch", "25"));
const [snapshotPath, proposalsPath] = args;
if (!snapshotPath || !proposalsPath) {
  console.error("usage: node tools/brand-plan.mjs <snapshot.json> <de-xuat-tung-sp.csv> [--include CHAC,KIEM] [--batch 25] [--out-dir dir]");
  process.exit(2);
}
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const proposals = parseCsv(await readFile(proposalsPath, "utf8"));
const outDir = flag("--out-dir", join(ROOT, "work", "brand-plan", snapshot.takenAt.replace(/[:.]/g, "-")));

// Merge to rename only when it saves at least this many product edits.
const MERGE_MIN_SAVING = 5;

const products = new Map(snapshot.products.filter((p) => !p.masterUnitId).map((p) => [String(p.id), p]));
const brandId = new Map(snapshot.brands.map((b) => [b.name, b.id]));
const brandName = (p) => p.brand?.name ?? "";

// ---- which proposals are live -------------------------------------------------
const skipped = [];
const target = new Map(); // productId -> target name ("" = no brand)
for (const r of proposals) {
  const p = products.get(String(r.kiotProductId));
  if (!p) {
    skipped.push(`${r.code} ${r.name}: không còn trên KiotViet`);
    continue;
  }
  if (brandName(p) !== r.current) {
    skipped.push(`${r.code} ${r.name}: TH đã đổi từ "${r.current}" thành "${brandName(p)}" sau khi lập đề xuất`);
    continue;
  }
  if (!include.has(r.confidence)) continue;
  if (r.proposed === "" && r.confidence !== "TRONG") continue; // no proposal, not a decision to clear
  target.set(String(r.kiotProductId), r.proposed);
}

// ---- survivors and renames ----------------------------------------------------
// For every KiotViet brand: the products it holds, by target.
const holdings = new Map(); // brand name -> Map(target -> count)
for (const [id, t] of target) {
  const cur = brandName(products.get(id));
  if (!cur || t === "") continue;
  if (!holdings.has(cur)) holdings.set(cur, new Map());
  holdings.get(cur).set(t, (holdings.get(cur).get(t) ?? 0) + 1);
}
const fold = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/[đĐ]/g, "d").toLowerCase().replace(/[^a-z0-9]+/g, "");
const holdsNow = (name) => [...products.values()].filter((p) => brandName(p) === name).length;
const majority = (name) => [...(holdings.get(name) ?? new Map())].sort((a, b) => b[1] - a[1])[0];

const renames = []; // {id, from, to}
const merges = []; // {from (blocking brand), into (survivor, current name), to}
const renamed = new Set();
const targets = new Set([...target.values()].filter(Boolean));
for (const t of targets) {
  // Candidates: brands whose biggest group of products goes to t.
  // Only a brand most of whose products go to t: renaming "Procter & Gamble"
  // to "Gillette" because 8 of its 23 products are Gillette would read as a
  // mistake to whoever runs the batch.
  const candidates = [...holdings.keys()]
    .filter((k) => k !== t && !renamed.has(k) && majority(k)?.[0] === t && majority(k)[1] * 2 > holdsNow(k))
    // "Heineken" holds 3 Strongbow and 1 Heineken: it is already a right name
    // (or one spelling away from one, like "Nestle"), so it is never renamed away.
    .filter((k) => ![...targets].some((other) => other !== t && fold(other) === fold(k)))
    .map((k) => ({ k, n: majority(k)[1] }))
    .sort((a, b) => b.n - a.n);
  const best = candidates[0];
  if (!best) continue;
  if (!brandId.has(t)) {
    renames.push({ id: brandId.get(best.k), from: best.k, to: t, products: best.n });
    renamed.add(best.k);
    continue;
  }
  // t exists already. Renaming `best` instead saves best.n edits but costs
  // moving the existing brand's products and deleting it first.
  const existingHeld = [...target].filter(([id]) => brandName(products.get(id)) === t).length;
  if (best.n - existingHeld >= MERGE_MIN_SAVING) {
    merges.push({ from: t, into: best.k, to: t, products: existingHeld });
    renames.push({ id: brandId.get(best.k), from: best.k, to: t, products: best.n });
    renamed.add(best.k);
  }
}

// Name each product's brand will show after phases 1–3.
const afterRename = (name) => {
  const m = merges.find((x) => x.from === name);
  if (m) name = m.into;
  return renames.find((r) => r.from === name)?.to ?? name;
};
const willExist = new Set([...brandId.keys()].filter((n) => !merges.some((m) => m.from === n)).map(afterRename));
const creates = [...targets].filter((t) => !willExist.has(t)).sort((a, b) => a.localeCompare(b, "vi"));

// ---- per-product edits --------------------------------------------------------
const edits = [];
for (const [id, t] of target) {
  const p = products.get(id);
  const showing = afterRename(brandName(p));
  if (showing === t) continue;
  edits.push({ id, code: p.code, name: p.name, active: p.isActive, from: showing, to: t });
}
const mergeMoves = [];
for (const m of merges)
  for (const [id] of target) {
    const p = products.get(id);
    if (brandName(p) === m.from) mergeMoves.push({ id, code: p.code, name: p.name, from: m.from, to: m.into });
  }
// A merge also moves products of the blocking brand whose own target is not t;
// those were already wrong and get their real target in phase 5.
for (const m of merges)
  for (const p of products.values())
    if (brandName(p) === m.from && !target.has(String(p.id)))
      skipped.push(`${p.code} ${p.name}: đang ở "${m.from}" (sẽ gộp) nhưng chưa có đề xuất duyệt — phải xử lý trước bước gộp`);

// ---- write batches ------------------------------------------------------------
await mkdir(outDir, { recursive: true });
const PLAN_COLUMNS = ["kind", "kiotProductId", "brandId", "from", "to"];
const show = (s) => (s ? `"${s}"` : "(trống)");
const files = [];
let seq = 0;

const productPrompt = (title, rows, note = "") => `# ${title}

Bạn đang điều khiển Chrome của tôi (đã đăng nhập KiotViet Trạm 8). Việc: đổi thương hiệu của **${rows.length} SP** theo bảng dưới. KHÔNG sửa bất cứ thứ gì khác. Không tạo, đổi tên hay xoá thương hiệu trong lô này.${note}

Cho TỪNG SP, lần lượt, không làm song song:
1. Hàng hoá → Danh sách hàng hoá → ô tìm: gõ đúng **mã hàng**, Enter. Phải ra **đúng 1 dòng**, tên khớp bảng.
2. Mở → Cập nhật. Ghi lại: thương hiệu, VAT bán, VAT nhập, giá bán sau thuế, tên hoá đơn điện tử.
3. Thương hiệu hiện tại phải **đúng** cột "TH hiện tại".
4. Ô Thương hiệu: chọn mục có tên **đúng từng ký tự** như cột "TH đích" (không chọn mục gần giống). "(trống)" = xoá thương hiệu, để ô trống.
5. Không chạm: tên hàng, tên HĐĐT, mã, mã vạch, giá, VAT, nhóm hàng, đơn vị, ảnh, mô tả, tồn.
6. Lưu. Mở lại SP: thương hiệu đúng đích; VAT, giá sau thuế, tên HĐĐT y như bước 2.

**Dừng và hỏi tôi nếu:** không tìm thấy / ra hơn 1 SP; TH hiện tại khác bảng; ô chọn không có đúng tên đích hoặc có 2 mục giống nhau; KiotViet báo lỗi; bất kỳ trường nào ở bước 6 khác bước 2; KiotViet hiện hộp thoại hỏi áp dụng cho đơn vị khác hoặc cập nhật giá.

Cuối cùng trả bảng: STT · Mã · Tên · TH trước → sau · VAT / giá sau thuế / tên HĐĐT có đổi không · Kết quả (OK / bỏ qua + lý do).

| STT | Mã hàng | Tên | TH hiện tại | TH đích |
|---|---|---|---|---|
${rows.map((r, i) => `| ${i + 1} | \`${r.code}\` | ${r.name} | ${show(r.from)} | ${show(r.to)} |`).join("\n")}
`;

async function emit(slug, title, planRows, prompt) {
  seq++;
  const base = `${String(seq).padStart(3, "0")}-${slug}`;
  await writeFile(join(outDir, `${base}.csv`), toCsv(planRows, PLAN_COLUMNS));
  await writeFile(join(outDir, `${base}.md`), prompt);
  files.push(`| ${base} | ${title} | ${planRows.length} |`);
}

const chunk = (list) => {
  const out = [];
  for (let i = 0; i < list.length; i += batchSize) out.push(list.slice(i, i + batchSize));
  return out;
};
const slugOf = (s) =>
  (s || "trong")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 32);

// 1 gop
for (const m of merges) {
  const rows = mergeMoves.filter((x) => x.from === m.from);
  for (const part of chunk(rows))
    await emit(
      `gop-${slugOf(m.from)}`,
      `Gộp "${m.from}" vào "${m.into}" (sau đó "${m.into}" đổi tên thành "${m.to}")`,
      part.map((r) => ({ kind: "product", kiotProductId: r.id, from: r.from, to: r.to })),
      productPrompt(`Lô ${seq + 1} — gộp "${m.from}" vào "${m.into}"`, part,
        `\n\nLưu ý: "${m.into}" là tên **tạm** (sẽ đổi thành "${m.to}" ở lô sau) — chọn đúng "${m.into}".`),
    );
}
// 2 xoa-cu, 3 doi-ten: one brand per batch, with the expected product count
const brandPrompt = (title, action, expectCount) => `# ${title}

Bạn đang điều khiển Chrome của tôi (đã đăng nhập KiotViet Trạm 8). Việc: **${action}**. Chỉ một thao tác này, không sửa SP nào.

1. Mở một SP bất kỳ → ô Thương hiệu → tìm chức năng quản lý thương hiệu (theo ghi chú trinh sát \`reports/thuong-hieu/trinh-sat.md\`).
2. Trước khi làm: đếm số SP đang dùng thương hiệu này (Danh sách hàng hoá → lọc theo thương hiệu, gồm cả hàng **ngừng kinh doanh**). Kỳ vọng: **${expectCount}**. Khác số này → **dừng, hỏi tôi**.
3. Làm thao tác. Tên mới (nếu có) gõ **đúng từng ký tự**, kể cả hoa/thường và dấu.
4. Kiểm tra lại: danh sách thương hiệu có đúng một mục với tên mới; không mục nào khác bị đổi.

Dừng và hỏi tôi nếu KiotViet báo trùng tên, báo lỗi, hoặc hỏi áp dụng cho SP nào.
`;
for (const m of merges)
  await emit(`xoa-cu-${slugOf(m.from)}`, `Xoá "${m.from}" (đã gộp hết SP)`,
    [{ kind: "delete", brandId: brandId.get(m.from), from: m.from }],
    brandPrompt(`Lô ${seq + 1} — xoá thương hiệu "${m.from}"`, `xoá thương hiệu "${m.from}" (#${brandId.get(m.from)})`, 0));
for (const r of renames) {
  const holding = [...products.values()].filter((p) => brandName(p) === r.from).length +
    mergeMoves.filter((x) => x.to === r.from).length;
  await emit(`doi-ten-${slugOf(r.to)}`, `Đổi tên "${r.from}" → "${r.to}"`,
    [{ kind: "rename", brandId: r.id, from: r.from, to: r.to }],
    brandPrompt(`Lô ${seq + 1} — đổi tên "${r.from}" → "${r.to}"`, `đổi tên thương hiệu "${r.from}" (#${r.id}) thành "${r.to}"`, `${holding} SP gốc (chưa tính lốc/thùng)`));
}
// 4 tao — creating is harmless; one batch, many names
for (const part of chunk(creates))
  await emit("tao", `Tạo ${part.length} thương hiệu`,
    part.map((n) => ({ kind: "create", to: n })),
    `# Lô ${seq + 1} — tạo ${part.length} thương hiệu

Bạn đang điều khiển Chrome của tôi (đã đăng nhập KiotViet Trạm 8). Việc: **tạo các thương hiệu dưới đây**, gõ đúng từng ký tự. Không gán cho SP nào, không sửa/xoá thương hiệu khác.
Trước mỗi tên: tìm trong danh sách thương hiệu — đã có mục giống (kể cả khác hoa/thường hoặc dấu) → **không tạo, ghi lại để báo tôi**.

${part.map((n, i) => `${i + 1}. \`${n}\``).join("\n")}

Cuối cùng trả bảng: STT · Tên · Đã tạo / bỏ qua + lý do.
`);
// 5 gan
const byTarget = new Map();
for (const e of edits.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1))) {
  const key = `${e.active ? "1" : "2"}|${e.to}`;
  if (!byTarget.has(key)) byTarget.set(key, []);
  byTarget.get(key).push(e);
}
for (const [key, rows] of [...byTarget].sort((a, b) => a[0].localeCompare(b[0], "vi"))) {
  const [phase, to] = key.split("|");
  for (const part of chunk(rows))
    await emit(`gan-${phase === "1" ? "" : "ngung-"}${slugOf(to)}`,
      `${phase === "1" ? "" : "(ngừng bán) "}Gán ${show(to)}`,
      part.map((r) => ({ kind: "product", kiotProductId: r.id, from: r.from, to: r.to })),
      productPrompt(`Lô ${seq + 1} — gán thương hiệu ${show(to)}${phase === "1" ? "" : " (SP ngừng kinh doanh)"}`, part));
}

const overview = [
  `# Kế hoạch lô — ${snapshot.takenAt}`,
  ``,
  `Từ \`${proposalsPath}\`, độ chắc được đưa vào: ${[...include].join(", ")}. **Chạy đúng thứ tự số.** Mỗi lô:`,
  `chụp \`brand-snapshot\` → dán prompt \`.md\` vào Claude in Chrome → chụp lại → \`brand-diff trước sau <lô>.csv\` phải ĐẠT.`,
  ``,
  `- Gộp: ${merges.length} · Đổi tên: ${renames.length} · Tạo: ${creates.length} · Sửa từng SP: ${edits.length} (+ ${mergeMoves.length} SP khi gộp)`,
  `- Bước 6 (xoá thương hiệu rỗng) lập sau, từ bản chụp mới nhất.`,
  ``,
  `| Lô | Việc | Dòng |`,
  `|---|---|---|`,
  ...files,
  ``,
  `## Bỏ qua (${skipped.length})`,
  ...skipped.map((s) => `- ${s}`),
  ``,
].join("\n");
await writeFile(join(outDir, "000-tong-quan.md"), overview);
console.log(overview.split("\n").slice(0, 8).join("\n"));
console.log(`${files.length} batches -> ${outDir}`);
