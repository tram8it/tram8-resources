/**
 * Read every KiotViet product and brand (trademark) through the Hub's
 * read-only gateway and save them as one snapshot file. A snapshot taken
 * before and after each Chrome batch is what brand-diff.mjs compares, and the
 * one taken before is how a batch is undone.
 *
 *   NODE_USE_ENV_PROXY=1 TRAM8_API_TOKEN=t8_live_… node tools/brand-snapshot.mjs [out.json]
 *
 * Default output: work/brand-snapshots/<UTC stamp>.json (work/ is not committed).
 * GET only; the gateway refuses anything else.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

import { ROOT } from "./lib.mjs";

const BASE = process.env.TRAM8_HUB_URL ?? "https://hub.tram8.vn";
const token = process.env.TRAM8_API_TOKEN;
if (!token) {
  console.error("TRAM8_API_TOKEN is not set");
  process.exit(2);
}

// One page size per pass: each moves the page boundaries (see readAll).
const PAGE_SIZES = [100, 97, 89, 83];

async function get(key, currentItem, pageSize) {
  const url = `${BASE}/api/v1/forward/${key}?pageSize=${pageSize}&currentItem=${currentItem}`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (res.ok) return res.json();
    const body = (await res.text()).slice(0, 300);
    if (attempt >= 4 || res.status < 500) throw new Error(`GET ${key}@${currentItem} -> HTTP ${res.status}: ${body}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

/**
 * Page through one gateway endpoint until every row is seen; fail rather than
 * save a partial catalogue.
 *
 * KiotViet pages by offset over an order with ties (measured 19/10/2026: two
 * products with the same modifiedDate swap between pages, so one pass returns
 * one of them twice and the other not at all — the same one on every pass of
 * the same page size). Each pass uses another page size so the boundaries
 * fall elsewhere; passes are merged by id, a later pass overriding an earlier
 * one, until the merged set reaches `total`.
 */
async function readAll(key) {
  const merged = new Map();
  let total = 0;
  for (const [pass, size] of PAGE_SIZES.entries()) {
    const first = await get(key, 0, size);
    total = first.total;
    const rows = [...first.data];
    for (let i = size; i < total; i += size) rows.push(...(await get(key, i, size)).data);
    for (const r of rows) merged.set(r.id, r);
    if (merged.size === total) return [...merged.values()];
    console.error(`${key}: pass ${pass + 1} has ${merged.size}/${total} distinct rows; reading again`);
  }
  throw new Error(`${key}: ${merged.size}/${total} rows after ${PAGE_SIZES.length} passes, snapshot not written`);
}

const sha = (s) => createHash("sha256").update(s ?? "").digest("hex").slice(0, 16);

/**
 * Keep what a brand edit could disturb; drop what changes on its own.
 * Stock (`inventories`) moves with every sale and `modifiedAt` with every save;
 * `units` repeats rows that are already in the list on their own.
 * The description is kept as a hash: the diff only needs to know it changed.
 */
function compact(p) {
  const { inventories, modifiedAt, units, description, ...rest } = p;
  return {
    ...rest,
    descriptionSha: sha(description),
    descriptionLength: (description ?? "").length,
    brandLine: brandLine(description),
    // "Hàng nội địa Trung" needs to know a pack is Chinese when it names no brand.
    chineseHint: /tiếng Trung|nội địa Trung|Trung Quốc|[\u4e00-\u9fff]/.test(description ?? ""),
    modifiedAt,
  };
}

/**
 * The "Thương hiệu: …" / "Nhà sản xuất/thương hiệu: …" line that the product
 * descriptions written in this repo end with — what brand-propose.mjs reads.
 * Descriptions pasted in by hand on KiotViet may be HTML, so tags go first.
 */
function brandLine(description) {
  const text = (description ?? "")
    .replace(/<br\s*\/?>|<\/p>|<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
  const m = text.match(/(?:Nhà sản xuất\/thương hiệu|Thương hiệu|Nhà sản xuất)\s*:\s*([^\n]+)/i);
  return m ? m[1].replace(/\s+/g, " ").trim().replace(/\.$/, "") : null;
}

const takenAt = new Date().toISOString();
const [brands, products] = await Promise.all([readAll("trademark"), readAll("products")]);
const out =
  process.argv[2] ?? join(ROOT, "work", "brand-snapshots", `${takenAt.replace(/[:.]/g, "-")}.json`);
await mkdir(dirname(out), { recursive: true });
await writeFile(
  out,
  JSON.stringify({
    takenAt,
    source: `${BASE}/api/v1/forward`,
    brands: brands.map(({ id, name }) => ({ id, name })),
    products: products.map(compact),
  }) + "\n",
);
console.log(`${brands.length} brands, ${products.length} products -> ${out}`);
