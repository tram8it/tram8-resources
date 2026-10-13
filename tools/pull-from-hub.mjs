/**
 * Pull the category tree and the active base products from the Hub content
 * API (read-only, GET only) and write them as an export folder that
 * init-from-export.mjs understands:
 *
 *   TRAM8_API_TOKEN=t8_live_… node tools/pull-from-hub.mjs
 *   (behind an HTTPS proxy, e.g. cloud sessions: prefix NODE_USE_ENV_PROXY=1)
 *   node tools/init-from-export.mjs inbox/hub-<stamp>
 *
 * The content API carries no sales figures, so revenue_90d is left empty;
 * STATUS.md then orders categories by product count until an export with
 * revenue is loaded.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { ROOT, toCsv } from "./lib.mjs";

const BASE = process.env.TRAM8_HUB_URL ?? "https://hub.tram8.vn";
const token = process.env.TRAM8_API_TOKEN;
if (!token) {
  console.error("TRAM8_API_TOKEN is not set");
  process.exit(2);
}

async function get(path) {
  const res = await fetch(`${BASE}/api/v1/content${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const { items: categories } = await get("/categories");

const products = [];
let cursor = null;
do {
  const qs = new URLSearchParams({ baseOnly: "true", limit: "200" });
  if (cursor) qs.set("cursor", cursor);
  const page = await get(`/products?${qs}`);
  products.push(...page.items);
  cursor = page.nextCursor ?? null;
} while (cursor);

const exportedAt = new Date().toISOString();
const dir = join(ROOT, "inbox", `hub-${exportedAt.replace(/[:.]/g, "-")}`);
await mkdir(dir, { recursive: true });

await writeFile(join(dir, "hub-categories.json"), JSON.stringify(categories, null, 2) + "\n");
await writeFile(join(dir, "hub-products.json"), JSON.stringify(products, null, 2) + "\n");
await writeFile(
  join(dir, "categories.csv"),
  toCsv(
    categories.map((c) => ({
      kiot_category_id: c.kiotCategoryId,
      name: c.name,
      parent_kiot_id: c.parentKiotId ?? "",
      path: c.path.join(" > "),
      active_products: c.activeProducts,
    })),
    ["kiot_category_id", "name", "parent_kiot_id", "path", "active_products"],
  ),
);
await writeFile(
  join(dir, "products.csv"),
  toCsv(
    products.map((p) => ({
      kiot_product_id: p.kiotProductId,
      kiot_base_product_id: p.kiotBaseProductId ?? "",
      is_active: p.isActive ? "t" : "f",
      code: p.code,
      barcode: p.barcode,
      name: p.name,
      full_name: p.fullName,
      brand_name: p.brand,
      unit: p.unit,
      kiot_category_id: p.category?.kiotCategoryId ?? "",
      category_name: p.category?.name,
      category_path: p.category?.path?.join(" > "),
      revenue_90d: "",
      image_url: p.kiotviet?.imageUrl,
      description: p.kiotviet?.description,
    })),
    [
      "kiot_product_id", "kiot_base_product_id", "is_active", "code", "barcode", "name", "full_name",
      "brand_name", "unit", "kiot_category_id", "category_name", "category_path", "revenue_90d",
      "image_url", "description",
    ],
  ),
);
await writeFile(
  join(dir, "summary.txt"),
  `exported_at: ${exportedAt}\nsource: ${BASE}/api/v1/content\ncategories: ${categories.length}\nproducts: ${products.length}\n`,
);

console.log(`${categories.length} categories, ${products.length} base products -> ${dir}`);
console.log(`next: node tools/init-from-export.mjs ${join("inbox", dir.split("/").pop())}`);
