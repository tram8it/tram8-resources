/**
 * Create or refresh the category/product folders from a tram8-hub export.
 *
 *   tar xzf tram8-product-export-<stamp>.tar.gz -C inbox/
 *   node tools/init-from-export.mjs inbox/tram8-product-export-<stamp>
 *
 * Safe to re-run with a newer export: it refreshes what the Hub holds
 * (name, category, current image/description) and never touches status,
 * decisions or history. A product whose category changed is moved and the
 * move is recorded. Products that left the export are reported, not deleted.
 *
 * Scope: the products in web-catalog.json when present (what tram8.vn shows);
 * otherwise every active base product.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { CATEGORIES_DIR, ROOT, loadAllProducts, parseCsv, slug, writeJson } from "./lib.mjs";

const input = process.argv[2];
if (!input) {
  console.error("usage: node tools/init-from-export.mjs <export-dir>");
  process.exit(2);
}
const dir = resolve(input);
const categories = parseCsv(await readFile(join(dir, "categories.csv"), "utf8"));
const products = parseCsv(await readFile(join(dir, "products.csv"), "utf8"));
const exportedAt = (await readFile(join(dir, "summary.txt"), "utf8").catch(() => ""))
  .match(/exported_at: (.*)/)?.[1] ?? null;

let scope;
const webPath = join(dir, "web-catalog.json");
if (existsSync(webPath)) {
  const web = JSON.parse(await readFile(webPath, "utf8"));
  const onWeb = new Set(web.products.map((p) => p.id));
  scope = products.filter((p) => onWeb.has(p.kiot_product_id));
  console.log(`scope: ${scope.length} products shown on tram8.vn`);
} else {
  // The web shows one card per base product; its image is the base product's.
  scope = products.filter((p) => p.is_active === "t" && !p.kiot_base_product_id);
  console.log(`scope: no web-catalog.json, ${scope.length} active base products`);
}

const categoryById = new Map(categories.map((c) => [c.kiot_category_id, c]));
const categoryDirName = (id) => {
  const c = categoryById.get(id);
  return c ? `${id}-${slug(c.name)}` : "0-chua-co-danh-muc";
};

const existing = new Map((await loadAllProducts()).map((p) => [p.meta.kiotProductId, p]));
const now = new Date().toISOString();
let created = 0;
let refreshed = 0;
let moved = 0;
const seen = new Set();

for (const p of scope) {
  seen.add(p.kiot_product_id);
  const catDir = categoryDirName(p.kiot_category_id);
  const catPath = join(CATEGORIES_DIR, catDir);
  await mkdir(catPath, { recursive: true });
  const catNote = join(catPath, "_category.md");
  if (!existsSync(catNote)) {
    const c = categoryById.get(p.kiot_category_id);
    await writeFile(
      catNote,
      `# ${c?.name ?? "Chưa có danh mục"}\n\nĐường dẫn: ${c?.path || c?.name || "—"} · KiotViet id: ${p.kiot_category_id || "—"}\n\n` +
        `## Khuôn mô tả riêng\n\n(Chốt ở lượt làm đầu tiên của category này. Trống = dùng khuôn chung trong RUBRIC.md.)\n\n` +
        `## Thương hiệu thường gặp\n\n(Điền khi làm.)\n`,
    );
  }
  const snapshot = {
    kiotProductId: p.kiot_product_id,
    code: p.code || null,
    barcode: p.barcode || null,
    name: p.name,
    fullName: p.full_name || null,
    brand: p.brand_name || null,
    unit: p.unit || null,
    category: {
      kiotCategoryId: p.kiot_category_id || null,
      name: p.category_name || null,
      path: p.category_path || p.category_name || null,
    },
    revenue90d: Number(p.revenue_90d || 0),
    current: { imageUrl: p.image_url || null, description: p.description || null, exportedAt },
  };

  const found = existing.get(p.kiot_product_id);
  if (!found) {
    const path = join(catPath, `${p.kiot_product_id}-${slug(p.name)}`);
    await mkdir(path, { recursive: true });
    await writeJson(join(path, "meta.json"), {
      ...snapshot,
      status: "TODO",
      image: { decision: null, reason: null, source: null, rubricVersion: null },
      description: { decision: null, reason: null, source: null, rubricVersion: null },
      question: null,
      history: [{ at: now, by: "init", status: "TODO", note: "created from export" }],
    });
    created++;
    continue;
  }
  let path = found.path;
  const meta = { ...found.meta, ...snapshot };
  if (found.categoryDir !== catDir) {
    const target = join(catPath, found.productDir);
    await rename(found.path, target);
    path = target;
    meta.history = [
      ...(meta.history ?? []),
      { at: now, by: "init", status: meta.status, note: `category moved ${found.categoryDir} -> ${catDir}` },
    ];
    moved++;
  }
  // The Hub's content changed under a decision already made: say so instead of
  // silently judging the new content by the old verdict.
  const before = found.meta.current ?? {};
  if (
    found.meta.status !== "TODO" &&
    (before.imageUrl !== snapshot.current.imageUrl || before.description !== snapshot.current.description)
  ) {
    meta.history = [
      ...(meta.history ?? []),
      { at: now, by: "init", status: meta.status, note: "current image/description changed in the Hub since review" },
    ];
  }
  await writeJson(join(path, "meta.json"), meta);
  refreshed++;
}

const gone = [...existing.keys()].filter((id) => !seen.has(id));

// Category order for STATUS.md: by 90-day revenue of the products in scope.
const revenueByCategory = new Map();
for (const p of scope) {
  const key = categoryDirName(p.kiot_category_id);
  const row = revenueByCategory.get(key) ?? {
    dir: key,
    kiotCategoryId: p.kiot_category_id || null,
    name: categoryById.get(p.kiot_category_id)?.name ?? "Chưa có danh mục",
    path: categoryById.get(p.kiot_category_id)?.path || null,
    products: 0,
    revenue90d: 0,
  };
  row.products++;
  row.revenue90d += Number(p.revenue_90d || 0);
  revenueByCategory.set(key, row);
}
await writeJson(join(ROOT, "data", "categories.json"), {
  exportedAt,
  categories: [...revenueByCategory.values()].sort((a, b) => b.revenue90d - a.revenue90d || b.products - a.products),
});

console.log(`created ${created} · refreshed ${refreshed} · moved ${moved}`);
if (gone.length) console.log(`no longer in export (kept, check by hand): ${gone.join(", ")}`);
console.log("next: node tools/status.mjs");
