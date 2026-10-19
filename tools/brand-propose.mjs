/**
 * Propose one canonical brand per KiotViet product, from a brand snapshot and
 * data/brand-canon.json. Read-only: writes reports, never touches KiotViet.
 *
 *   node tools/brand-propose.mjs <snapshot.json> [--out-dir reports/thuong-hieu]
 *
 * Evidence, strongest first:
 *   1. the description's brand line ("Nhà sản xuất/thương hiệu: Masan Consumer · Omachi"),
 *      written in this repo from the pack and the maker's own site;
 *   2. the product name;
 *   3. the brand KiotViet has now.
 * A company (t = company in the canon) is used only when no brand matches.
 *
 * Writes de-xuat-tung-sp.csv (one row per base product; lốc/thùng follow their
 * base product) and de-xuat-tom-tat.md (counts, brands to create / rename).
 */
import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

import { ROOT, toCsv } from "./lib.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 ? args.splice(at, 2)[1] : fallback;
};
const outDir = flag("--out-dir", join(ROOT, "reports", "thuong-hieu"));
// categories/ of this repo: description.md files written but not yet on KiotViet.
const categoriesDir = flag("--categories", join(ROOT, "categories"));
const imageReadsPath = flag("--image-reads", join(ROOT, "reports", "thuong-hieu", "doc-anh.json"));
const [snapshotPath] = args;
if (!snapshotPath) {
  console.error("usage: node tools/brand-propose.mjs <snapshot.json> [--out-dir dir] [--categories dir]");
  process.exit(2);
}

const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const canon = JSON.parse(await readFile(join(ROOT, "data", "brand-canon.json"), "utf8")).brands;

/** Lower case, no accents, punctuation to spaces: "Lay's (PepsiCo)" -> "lay s pepsico". */
const norm = (s) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// ---- canon ------------------------------------------------------------------
const byName = new Map();
for (const e of canon) {
  if (byName.has(e.n)) throw new Error(`brand-canon: duplicate name ${e.n}`);
  byName.set(e.n, e);
}
for (const e of canon) if (e.p && !byName.has(e.p)) throw new Error(`brand-canon: ${e.n} has unknown parent ${e.p}`);

/**
 * A line becomes its own brand once it has this many products, so the shop can
 * filter by it (Mirinda has many flavours); a line with 1–2 products goes
 * under its parent (owner, 19/10/2026). `up: false` / `up: true` in the canon
 * force either way.
 */
const MIN_LINE_PRODUCTS = 3;
// Products proposed under each entry and its lines; null on the first pass,
// which proposes the most specific entry for every product to count them.
let lineCounts = null;

/** The name KiotViet must show for this entry: climb parents that roll up. */
function kiotName(e) {
  if (lineCounts === null) return e.n;
  let cur = e;
  for (let guard = 0; cur.p && cur.up !== false; guard++) {
    if (guard > 10) throw new Error(`brand-canon: parent loop at ${e.n}`);
    if (cur.up !== true && (lineCounts.get(cur.n) ?? 0) >= MIN_LINE_PRODUCTS) break;
    cur = byName.get(cur.p);
  }
  return cur.n;
}
const ancestors = (e) => {
  const out = [];
  for (let cur = e; cur.p; cur = byName.get(cur.p)) out.push(cur.p);
  return out;
};
/**
 * Is `child` a line or product of `parent`? Through the parent chain, or the
 * company field — which may spell the parent longer ("Coca-Cola Việt Nam" for
 * the brand "Coca-Cola"), hence the containment test.
 */
function isUnder(child, parent) {
  if (ancestors(child).includes(parent.n)) return true;
  for (let cur = child; cur; cur = cur.p ? byName.get(cur.p) : undefined)
    if (cur.c !== undefined && ` ${norm(cur.c)} `.includes(` ${norm(parent.n)} `)) return true;
  return false;
}

const aliases = [];
const aliasOwner = new Map();
for (const e of canon) {
  for (const raw of [e.n, ...(e.a ?? [])]) {
    const key = norm(raw);
    if (!key) continue;
    const prev = aliasOwner.get(key);
    if (prev && prev !== e.n) throw new Error(`brand-canon: alias "${raw}" belongs to both ${prev} and ${e.n}`);
    if (prev) continue;
    aliasOwner.set(key, e.n);
    aliases.push({ tokens: key.split(" "), entry: e, descOnly: e.desc === true });
  }
}
// Longest alias first, so "thuoc la thang long" (company) is consumed before "thang long".
aliases.sort((x, y) => y.tokens.length - x.tokens.length);

/** Entries named in `text`; each word is used by at most one alias. */
function match(text, { allowDescOnly }) {
  const words = norm(text).split(" ").filter(Boolean);
  const used = new Array(words.length).fill(false);
  const found = new Set();
  for (const al of aliases) {
    if (al.descOnly && !allowDescOnly) continue;
    const n = al.tokens.length;
    for (let i = 0; i + n <= words.length; i++) {
      let ok = true;
      for (let j = 0; j < n && ok; j++) ok = !used[i + j] && words[i + j] === al.tokens[j];
      if (!ok) continue;
      for (let j = 0; j < n; j++) used[i + j] = true;
      found.add(al.entry);
    }
  }
  return found;
}

/**
 * Brands (KiotViet names) and companies named in `text`. When both a parent
 * and its child are named ("Nestlé · MILO", "Wrigley's · Doublemint"), the
 * child wins: it is the more specific statement about this product.
 */
function resolve(text, opts) {
  const found = [...match(text, opts)];
  const brands = found.filter((e) => e.t !== "company");
  const companies = found.filter((e) => e.t === "company").map((e) => e.n);
  const specific = brands.filter((x) => !brands.some((y) => y !== x && isUnder(y, x)));
  return {
    brands: [...new Set((specific.length ? specific : brands).map(kiotName))],
    companies: [...new Set(companies)],
    asked: brands.some((e) => e.ask === true || (e.p && byName.get(kiotName(e)).ask === true)),
  };
}

/** Same extraction as brand-snapshot.mjs, for description.md files. */
const brandLineOf = (text) => {
  const m = (text ?? "").match(/(?:Nhà sản xuất\/thương hiệu|Thương hiệu|Nhà sản xuất)\s*:\s*([^\n]+)/i);
  return m ? m[1].replace(/\s+/g, " ").trim().replace(/\.$/, "") : null;
};

/** kiotProductId -> brand line of a description.md in categories/<cat>/<id>-<slug>/. */
async function localBrandLines(dir) {
  const out = new Map();
  if (!existsSync(dir)) return out;
  for (const cat of await readdir(dir, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const prod of await readdir(join(dir, cat.name), { withFileTypes: true })) {
      const id = prod.isDirectory() ? prod.name.match(/^(\d+)-/)?.[1] : undefined;
      const file = id && join(dir, cat.name, prod.name, "description.md");
      if (!file || !existsSync(file)) continue;
      const line = brandLineOf(await readFile(file, "utf8"));
      if (line) out.set(id, line);
    }
  }
  return out;
}
const pending = await localBrandLines(categoriesDir);

// Brands read off the pack photo for products with nothing else to go on:
// [{ id, brand, kind: BRAND|COMPANY|KHONG_NHAN|KHONG_DOC_DUOC, confidence: CHAC|KHONG_CHAC, seen }].
const imageReads = new Map(
  existsSync(imageReadsPath) ? JSON.parse(await readFile(imageReadsPath, "utf8")).map((r) => [String(r.id), r]) : [],
);

// ---- products ---------------------------------------------------------------
const kiotBrands = new Map(snapshot.brands.map((b) => [b.name, b.id]));
function propose() {
const rows = [];
for (const p of snapshot.products) {
  if (p.masterUnitId) continue;
  const current = p.brand?.name ?? "";
  // What KiotViet shows wins; a description written here but not applied yet
  // is the fallback.
  const pendingLine = p.brandLine ? null : pending.get(String(p.id));
  const line = p.brandLine ?? pendingLine ?? "";
  // "Celano (KIDO Foods)": what is in brackets is usually the company or an
  // alternative spelling, so it only counts when the rest names nothing.
  const linePrimary = line.replace(/\([^)]*\)/g, " ");
  const lineBrackets = [...line.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).join(" · ");

  let fromLine = resolve(linePrimary, { allowDescOnly: true });
  if (!fromLine.brands.length) {
    const b = resolve(lineBrackets, { allowDescOnly: true });
    fromLine = { ...b, companies: [...fromLine.companies, ...b.companies] };
  }
  const fromName = resolve(p.name, { allowDescOnly: false });
  const fromKiot = resolve(current, { allowDescOnly: true });

  let proposed = "";
  let confidence = "";
  let basis = "";
  const notes = [];
  const other = (list, x) => list.filter((b) => b !== x);

  if (fromLine.brands.length === 1) {
    proposed = fromLine.brands[0];
    basis = "mô tả";
    // "Wrigley's (Mỹ)" in the description, "Doublemint" in the name: the name
    // is the more specific of the two and they agree.
    const finer = fromName.brands.filter((b) => isUnder(byName.get(b), byName.get(proposed)));
    if (finer.length === 1) {
      proposed = finer[0];
      basis = "mô tả + tên";
    }
    const clash = other(fromName.brands, proposed).filter((b) => !isUnder(byName.get(proposed), byName.get(b)));
    if (clash.length) {
      confidence = "HOI";
      notes.push(`tên SP nhắc ${clash.join(", ")}`);
    } else confidence = "CHAC";
  } else if (fromLine.brands.length > 1) {
    const both = fromLine.brands.filter((b) => fromName.brands.includes(b));
    if (both.length === 1) {
      proposed = both[0];
      confidence = "KIEM";
      basis = "mô tả + tên";
      notes.push(`mô tả nhắc nhiều nhãn: ${fromLine.brands.join(", ")}`);
    } else {
      confidence = "HOI";
      basis = "mô tả";
      notes.push(`mô tả nhắc nhiều nhãn: ${fromLine.brands.join(", ")}`);
    }
  } else if (imageReads.has(String(p.id)) && imageReads.get(String(p.id)).kind !== "KHONG_DOC_DUOC") {
    const read = imageReads.get(String(p.id));
    basis = `ảnh: ${read.seen ?? ""}`.trim();
    if (read.kind === "KHONG_NHAN") {
      confidence = fromName.brands.length ? "HOI" : "TRONG";
      if (fromName.brands.length) notes.push(`ảnh không thấy nhãn, tên SP nhắc ${fromName.brands.join(", ")}`);
    } else {
      const known = resolve(read.brand, { allowDescOnly: true });
      proposed = known.brands[0] ?? known.companies[0] ?? read.brand;
      if (!known.brands.length && !known.companies.length) notes.push("nhãn mới, chưa có trong bảng chuẩn");
      const clash = other(fromName.brands, proposed);
      if (clash.length) {
        confidence = "HOI";
        notes.push(`tên SP nhắc ${clash.join(", ")}`);
      } else confidence = read.confidence === "CHAC" && known.brands.length ? "CHAC" : "KIEM";
    }
  } else if (fromName.brands.length === 1) {
    proposed = fromName.brands[0];
    confidence = "KIEM";
    basis = "tên SP";
  } else if (fromName.brands.length > 1) {
    confidence = "HOI";
    basis = "tên SP";
    notes.push(`tên SP nhắc nhiều nhãn: ${fromName.brands.join(", ")}`);
  } else if (fromKiot.brands.length === 1) {
    proposed = fromKiot.brands[0];
    confidence = "GIU_CHUA_KIEM";
    basis = "TH hiện tại";
  } else {
    const company = fromLine.companies[0] ?? fromName.companies[0] ?? fromKiot.companies[0];
    if (company) {
      proposed = company;
      confidence = "KIEM";
      basis = "chỉ biết công ty";
    } else {
      confidence = "XEM_ANH";
      basis = line ? "mô tả có dòng TH nhưng không khớp bảng chuẩn" : "không có căn cứ";
    }
  }
  if (proposed && fromKiot.brands.length && !fromKiot.brands.includes(proposed) && current)
    notes.push(`đang gắn ${current} (${fromKiot.brands.join(", ")})`);
  if (current && !fromKiot.brands.length && !fromKiot.companies.length) notes.push(`TH hiện tại "${current}" không có trong bảng chuẩn`);
  if (fromLine.asked || fromName.asked) notes.push("nhãn này chủ chưa chốt (ask)");
  if (pendingLine && line) notes.push("dòng TH lấy từ description.md chưa đẩy lên KiotViet");

  rows.push({
    kiotProductId: p.id,
    code: p.code,
    name: p.name,
    category: p.category?.name ?? "",
    active: p.isActive ? "đang bán" : "ngừng",
    current,
    proposed,
    change: proposed === current ? "giữ" : !current ? "thêm" : !proposed ? "—" : "đổi",
    confidence,
    basis,
    brandLine: line,
    note: notes.join("; "),
  });
}
return rows;
}

lineCounts = new Map();
const firstPass = (() => {
  const saved = lineCounts;
  lineCounts = null;
  const out = propose();
  lineCounts = saved;
  return out;
})();
for (const r of firstPass) {
  for (let e = byName.get(r.proposed); e; e = e.p ? byName.get(e.p) : undefined)
    lineCounts.set(e.n, (lineCounts.get(e.n) ?? 0) + 1);
}
const rows = propose();

rows.sort(
  (a, b) =>
    (a.active === b.active ? 0 : a.active === "đang bán" ? -1 : 1) ||
    a.proposed.localeCompare(b.proposed, "vi") ||
    a.name.localeCompare(b.name, "vi"),
);

// ---- summary ------------------------------------------------------------------
const count = (f) => rows.filter(f).length;
const tally = (key) => {
  const m = new Map();
  for (const r of rows) m.set(r[key], (m.get(r[key]) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]);
};
const targetCounts = new Map();
for (const r of rows) if (r.proposed) targetCounts.set(r.proposed, (targetCounts.get(r.proposed) ?? 0) + 1);

// A KiotViet brand whose products all go to one canonical name it does not
// spell yet can be renamed once instead of editing each product.
const renameCandidates = [];
for (const [kName, kId] of kiotBrands) {
  const own = rows.filter((r) => r.current === kName);
  const targets = new Set(own.map((r) => r.proposed).filter(Boolean));
  if (own.length && targets.size === 1) {
    const [to] = targets;
    if (to !== kName && !kiotBrands.has(to)) renameCandidates.push({ id: kId, from: kName, to, products: own.length });
  }
}
const toCreate = [...targetCounts]
  .filter(([n]) => !kiotBrands.has(n) && !renameCandidates.some((r) => r.to === n))
  .sort((a, b) => b[1] - a[1]);

const md = [
  `# Đề xuất thương hiệu từng SP — tóm tắt`,
  ``,
  `Sinh bởi \`tools/brand-propose.mjs\` từ bản chụp ${snapshot.takenAt}. **Chỉ là đề xuất** — chưa ghi gì lên KiotViet.`,
  `Bảng đầy đủ: [\`de-xuat-tung-sp.csv\`](de-xuat-tung-sp.csv).`,
  ``,
  `| | SP gốc |`,
  `|---|---|`,
  `| Tổng | ${rows.length} |`,
  ...tally("confidence").map(([k, v]) => `| Độ chắc \`${k}\` | ${v} |`),
  ...tally("change").map(([k, v]) => `| Thay đổi: ${k} | ${v} |`),
  ``,
  `Độ chắc: \`CHAC\` = dòng thương hiệu trong mô tả (viết từ bao bì/trang hãng) và tên SP không mâu thuẫn ·`,
  `\`KIEM\` = chỉ từ tên SP, chỉ biết công ty, hoặc nhãn đọc từ ảnh chưa chắc/chưa có trong bảng chuẩn ·`,
  `\`HOI\` = các nguồn mâu thuẫn · \`GIU_CHUA_KIEM\` = chỉ có thương hiệu KiotViet đang gắn ·`,
  `\`TRONG\` = đã xem ảnh, bao bì không có nhãn → để trống · \`XEM_ANH\` = không có căn cứ, phải xem ảnh.`,
  ``,
  `## Thương hiệu KiotViet nên đổi tên (mọi SP của nó cùng về một tên chuẩn)`,
  ``,
  `| tradeMarkId | Hiện tại | Tên chuẩn | SP |`,
  `|---|---|---|---|`,
  ...renameCandidates.map((r) => `| ${r.id} | ${r.from} | ${r.to} | ${r.products} |`),
  ``,
  `## Thương hiệu chuẩn chưa có trên KiotViet (cần tạo) — ${toCreate.length}`,
  ``,
  toCreate.map(([n, c]) => `${n} (${c})`).join(" · "),
  ``,
].join("\n");

await mkdir(outDir, { recursive: true });
const columns = ["kiotProductId", "code", "name", "category", "active", "current", "proposed", "change", "confidence", "basis", "brandLine", "note"];
await writeFile(join(outDir, "de-xuat-tung-sp.csv"), toCsv(rows, columns));
await writeFile(join(outDir, "de-xuat-tom-tat.md"), md);
console.log(md.split("\n").slice(0, 20).join("\n"));
