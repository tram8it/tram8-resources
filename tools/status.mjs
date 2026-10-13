/**
 * Regenerate STATUS.md, NEEDS_PHOTO.csv and ASK_OWNER.md from every meta.json.
 *
 *   node tools/status.mjs
 *
 * meta.json is the record; these files are views of it and are never edited
 * by hand. Exits non-zero when a meta.json is inconsistent, so a broken record
 * is fixed before it is committed.
 */
import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { ROOT, STATUSES, loadAllProducts, readJson, toCsv, validateMeta } from "./lib.mjs";

const all = await loadAllProducts();
const order = (await readJson(join(ROOT, "data", "categories.json"), { categories: [] })).categories;
const rank = new Map(order.map((c, i) => [c.dir, i]));

const problems = [];
const byCategory = new Map();
for (const p of all) {
  for (const problem of validateMeta(p.meta, p.path)) problems.push(`${relative(ROOT, p.path)}: ${problem}`);
  const row = byCategory.get(p.categoryDir) ?? {
    dir: p.categoryDir,
    name: p.meta.category?.name ?? p.categoryDir,
    revenue90d: 0,
    total: 0,
    ...Object.fromEntries(STATUSES.map((s) => [s, 0])),
  };
  row.total++;
  row[p.meta.status] = (row[p.meta.status] ?? 0) + 1;
  row.revenue90d += p.meta.revenue90d ?? 0;
  byCategory.set(p.categoryDir, row);
}
const rows = [...byCategory.values()].sort(
  (a, b) => (rank.get(a.dir) ?? 1e9) - (rank.get(b.dir) ?? 1e9) || b.revenue90d - a.revenue90d,
);

const done = (r) => r.NO_CHANGE + r.UPLOADED;
const reviewed = (r) => r.total - r.TODO;
const sum = (key) => rows.reduce((n, r) => n + (typeof key === "function" ? key(r) : r[key]), 0);
const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : "—");
const money = (n) => `${(n / 1e6).toFixed(1)}tr`;

const lines = [
  "# STATUS — tiến độ làm mới ảnh & mô tả",
  "",
  "> Sinh tự động bởi `node tools/status.mjs`. **Không sửa tay.** Nguồn sự thật là `meta.json` của từng SP.",
  "",
  `Tổng ${sum("total")} SP · đã xem ${sum(reviewed)} (${pct(sum(reviewed), sum("total"))}) · ` +
    `xong ${sum(done)} · chờ chủ duyệt ${sum("READY")} · cần chụp ${sum("NEEDS_PHOTO")} · hỏi chủ ${sum("ASK_OWNER")}`,
  "",
  "Thứ tự làm: từ trên xuống (doanh số 90 ngày giảm dần). `xong` = giữ nguyên + đã lên web.",
  "",
  "| # | Category | DT 90 ngày | Tổng | Chưa xem | Giữ nguyên | Đang làm | Cần chụp | Hỏi chủ | Chờ duyệt | Đã duyệt | Đã lên web |",
  "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
  ...rows.map(
    (r, i) =>
      `| ${i + 1} | ${r.name} | ${money(r.revenue90d)} | ${r.total} | ${r.TODO} | ${r.NO_CHANGE} | ${r.IN_PROGRESS} | ${r.NEEDS_PHOTO} | ${r.ASK_OWNER} | ${r.READY} | ${r.APPROVED} | ${r.UPLOADED} |`,
  ),
  "",
];
if (problems.length) lines.push("## ⚠️ Bản ghi lỗi", "", ...problems.map((p) => `- ${p}`), "");
await writeFile(join(ROOT, "STATUS.md"), lines.join("\n"));

const photo = all
  .filter((p) => p.meta.status === "NEEDS_PHOTO")
  .sort((a, b) => (rank.get(a.categoryDir) ?? 1e9) - (rank.get(b.categoryDir) ?? 1e9) || (b.meta.revenue90d ?? 0) - (a.meta.revenue90d ?? 0))
  .map((p) => ({
    category: p.meta.category?.name,
    code: p.meta.code,
    barcode: p.meta.barcode,
    name: p.meta.name,
    why: p.meta.image?.reason,
    folder: relative(ROOT, p.path),
    done: "",
  }));
await writeFile(
  join(ROOT, "NEEDS_PHOTO.csv"),
  toCsv(photo, ["category", "code", "barcode", "name", "why", "folder", "done"]),
);

const asks = all.filter((p) => p.meta.status === "ASK_OWNER");
await writeFile(
  join(ROOT, "ASK_OWNER.md"),
  [
    "# Câu hỏi cho chủ",
    "",
    "> Sinh tự động. Trả lời bằng tin nhắn, hoặc ghi vào `answers/<kiotProductId>.md`.",
    "",
    ...(asks.length
      ? asks.map((p) => `- **${p.meta.name}** (\`${p.meta.code ?? p.meta.kiotProductId}\`, ${p.meta.category?.name ?? "—"}): ${p.meta.question ?? "(thiếu câu hỏi)"}`)
      : ["Không có câu hỏi nào đang chờ."]),
    "",
  ].join("\n"),
);

console.log(`${all.length} products · ${rows.length} categories · ${photo.length} need a photo · ${asks.length} questions`);
if (problems.length) {
  console.error(`${problems.length} inconsistent record(s), listed in STATUS.md:`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
