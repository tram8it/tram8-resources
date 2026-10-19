/**
 * Compare two brand snapshots (brand-snapshot.mjs) against what a Chrome batch
 * was meant to do, and fail loudly on anything else.
 *
 *   node tools/brand-diff.mjs <before.json> <after.json> [plan.csv] [--zero-weight] [--out report.md]
 *
 * plan.csv columns (header required): kind,kiotProductId,brandId,from,to
 *   product  kiotProductId, from (current brand name, empty = none), to (target name, empty = remove)
 *   rename   brandId, from, to   — every product on that brand is expected to show `to`
 *   create   to
 *   delete   brandId, from
 * No plan = nothing is expected to change.
 *
 * Exit 0 only when every planned change is there, spelled exactly, and nothing
 * else changed: not a brand outside the plan, not tax, price, name, category,
 * description, image or any other field (the 17/10/2026 VAT incident was an
 * edit that silently reset tax on save). Exit 1 otherwise.
 */
import { readFile, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

import { parseCsv } from "./lib.mjs";

const args = process.argv.slice(2);
// Owner, 19/10/2026: weights go to 0 for now (the description states grams;
// they get filled in one go later). With this flag a weight that became 0 is
// a note; a weight that changed to anything else is still an alarm.
const zeroAt = args.indexOf("--zero-weight");
const zeroWeight = zeroAt >= 0 && args.splice(zeroAt, 1).length > 0;
const outAt = args.indexOf("--out");
const outPath = outAt >= 0 ? args.splice(outAt, 2)[1] : null;
const [beforePath, afterPath, planPath] = args;
if (!beforePath || !afterPath) {
  console.error("usage: node tools/brand-diff.mjs <before.json> <after.json> [plan.csv] [--out report.md]");
  process.exit(2);
}

const before = JSON.parse(await readFile(beforePath, "utf8"));
const after = JSON.parse(await readFile(afterPath, "utf8"));
const plan = planPath ? parseCsv(await readFile(planPath, "utf8")) : [];

const alarms = [];
const notes = [];
const done = [];
const alarm = (kind, text) => alarms.push(`- **${kind}** ${text}`);

for (const [i, row] of plan.entries()) {
  const ok =
    (row.kind === "product" && row.kiotProductId && (row.to || row.from)) ||
    (row.kind === "rename" && row.brandId && row.from && row.to) ||
    (row.kind === "create" && row.to) ||
    (row.kind === "delete" && row.brandId && row.from);
  if (!ok) {
    console.error(`plan row ${i + 2} is incomplete or has an unknown kind: ${JSON.stringify(row)}`);
    process.exit(2);
  }
}
const byKind = (k) => plan.filter((r) => r.kind === k);
const productPlan = new Map(byKind("product").map((r) => [String(r.kiotProductId), r]));
const renamePlan = new Map(byKind("rename").map((r) => [String(r.brandId), r]));
const createPlan = new Map(byKind("create").map((r) => [r.to, r]));
const productTargets = new Set(byKind("product").map((r) => r.to).filter(Boolean));
const deletePlan = new Map(byKind("delete").map((r) => [String(r.brandId), r]));

// ---- brand list -------------------------------------------------------------
const brandsBefore = new Map(before.brands.map((b) => [String(b.id), b.name]));
const brandsAfter = new Map(after.brands.map((b) => [String(b.id), b.name]));
const show = (s) => JSON.stringify(s ?? "");

for (const [id, name] of brandsAfter) {
  if (!brandsBefore.has(id)) {
    if (createPlan.has(name)) {
      done.push(`tạo ${show(name)} (#${id})`);
      createPlan.delete(name);
    } else if (productTargets.has(name)) {
      // An Excel import creates a brand it does not know yet, under exactly the
      // name in the file (measured 19/10/2026, batch 2: 11 new brands, once each).
      done.push(`tạo khi nhập file ${show(name)} (#${id})`);
    } else alarm("TH_MOI_NGOAI_KE_HOACH", `#${id} ${show(name)}`);
  } else if (brandsBefore.get(id) !== name) {
    const r = renamePlan.get(id);
    if (r && r.to === name) done.push(`đổi tên #${id} ${show(brandsBefore.get(id))} → ${show(name)}`);
    else alarm("DOI_TEN_SAI", `#${id} ${show(brandsBefore.get(id))} → ${show(name)}${r ? ` (kế hoạch: ${show(r.to)})` : " (không có trong kế hoạch)"}`);
  }
}
for (const [id, name] of brandsBefore) {
  if (brandsAfter.has(id)) continue;
  if (deletePlan.has(id)) done.push(`xoá #${id} ${show(name)}`);
  else alarm("TH_BI_XOA_NGOAI_KE_HOACH", `#${id} ${show(name)}`);
}
for (const [name] of createPlan) alarm("CHUA_TAO", show(name));
for (const [id, r] of renamePlan)
  if (brandsAfter.get(id) === brandsBefore.get(id)) alarm("CHUA_DOI_TEN", `#${id} ${show(r.from)} → ${show(r.to)}`);
for (const [id, r] of deletePlan) if (brandsAfter.has(id)) alarm("CHUA_XOA", `#${id} ${show(r.from)}`);

// ---- products ---------------------------------------------------------------
const pBefore = new Map(before.products.map((p) => [String(p.id), p]));
const pAfter = new Map(after.products.map((p) => [String(p.id), p]));
const label = (p) => `${p.code} ${show(p.name)} (#${p.id})`;
const brandName = (p) => p.brand?.name ?? "";
// brandLine and chineseHint are read out of the description, which descriptionSha already covers.
let zeroed = 0;
const IGNORED = new Set(["brand", "modifiedAt", "brandLine", "chineseHint"]);

for (const [id, p] of pBefore) if (!pAfter.has(id)) alarm("SP_BIEN_MAT", label(p));
for (const [id, p] of pAfter) if (!pBefore.has(id)) notes.push(`- SP mới tạo giữa hai lần chụp: ${label(p)} — TH ${show(brandName(p))}`);

for (const [id, a] of pAfter) {
  const b = pBefore.get(id);
  if (!b) continue;
  // A lốc/thùng row follows its base product's brand.
  const planned = productPlan.get(id) ?? (a.masterUnitId ? productPlan.get(String(a.masterUnitId)) : undefined);
  const renamed = b.brand ? renamePlan.get(String(b.brand.id)) : undefined;
  const deleted = b.brand ? deletePlan.get(String(b.brand.id)) : undefined;
  let expected = brandName(b);
  if (planned) expected = planned.to;
  else if (renamed) expected = renamed.to;
  else if (deleted) alarm("XOA_TH_CON_SP", `${label(b)} đang dùng TH sắp xoá #${b.brand.id} ${show(b.brand.name)}`);

  if (planned && !a.masterUnitId && (planned.from ?? "") !== brandName(b))
    alarm("KE_HOACH_CU", `${label(b)}: kế hoạch ghi TH hiện tại ${show(planned.from)}, thực tế trước lô ${show(brandName(b))}`);

  const got = brandName(a);
  if (got !== expected) {
    if (got.trim() === expected.trim()) alarm("SAI_KHOANG_TRANG", `${label(a)}: ${show(got)} ≠ ${show(expected)}`);
    else if (got.toLocaleLowerCase("vi") === expected.toLocaleLowerCase("vi"))
      // An import matches brand names regardless of case and keeps the old
      // spelling (batch 2, 19/10/2026): fixed by renaming the brand itself.
      notes.push(`- ${label(a)}: còn ${show(got)}, chờ đổi tên thương hiệu thành ${show(expected)}`);
    else if (planned && got === brandName(b)) alarm("CHUA_LAM", `${label(a)}: vẫn ${show(got)}, cần ${show(expected)}`);
    else alarm("SAI_THUONG_HIEU", `${label(a)}: ${show(brandName(b))} → ${show(got)}, cần ${show(expected)}`);
  } else if (planned && got !== brandName(b) && !a.masterUnitId) done.push(`${label(a)}: ${show(brandName(b))} → ${show(got)}`);

  // Saving the KiotViet web form rewrites the description without changing
  // its text: line breaks become <br>, and a lốc/thùng row takes its base
  // product's description (measured 19/10/2026). Same text = a note, not an alarm.
  const descKeys = ["descriptionSha", "descriptionLength", "descriptionTextSha"];
  const descChanged = descKeys.some((k) => !isDeepStrictEqual(b[k], a[k]));
  let descHandled = false;
  if (descChanged && b.descriptionTextSha && a.descriptionTextSha) {
    const base = a.masterUnitId ? pAfter.get(String(a.masterUnitId)) : undefined;
    if (b.descriptionTextSha === a.descriptionTextSha) {
      notes.push(`- ${label(a)}: mô tả đổi định dạng xuống dòng (chữ giữ nguyên)`);
      descHandled = true;
    } else if (base && a.descriptionTextSha === base.descriptionTextSha) {
      notes.push(`- ${label(a)}: đơn vị nhận mô tả của hàng gốc (${b.descriptionLength} → ${a.descriptionLength} ký tự)`);
      descHandled = true;
    }
  }
  for (const key of new Set([...Object.keys(b), ...Object.keys(a)])) {
    if (IGNORED.has(key) || isDeepStrictEqual(b[key], a[key])) continue;
    // "" and null both mean "nothing here" (orderTemplate turned "" → null on import).
    if ((b[key] === "" || b[key] === null || b[key] === undefined) && (a[key] === "" || a[key] === null || a[key] === undefined)) continue;
    if (descHandled && descKeys.includes(key)) continue;
    if (zeroWeight && key === "weight" && a.weight === 0) {
      zeroed++;
      continue;
    }
    alarm("TRUONG_KHAC_BI_DOI", `${label(a)} · \`${key}\`: ${JSON.stringify(b[key])} → ${JSON.stringify(a[key])}`);
  }
}

if (zeroed) notes.push(`- ${zeroed} dòng hàng có trọng lượng về 0 (--zero-weight)`);

const report = [
  `# So sánh thương hiệu`,
  ``,
  `- Trước: ${before.takenAt} · Sau: ${after.takenAt}`,
  `- Kế hoạch: ${planPath ?? "(không có — không được đổi gì)"} · ${plan.length} dòng`,
  `- **${alarms.length === 0 ? "ĐẠT" : `KHÔNG ĐẠT — ${alarms.length} cảnh báo`}** · ${done.length} thay đổi đúng kế hoạch`,
  ``,
  `## Cảnh báo`,
  ...(alarms.length ? alarms : ["(không có)"]),
  ``,
  `## Đã đúng kế hoạch`,
  ...(done.length ? done.map((d) => `- ${d}`) : ["(không có)"]),
  ``,
  `## Ghi chú`,
  ...(notes.length ? notes : ["(không có)"]),
  ``,
].join("\n");

if (outPath) await writeFile(outPath, report);
console.log(report);
process.exit(alarms.length ? 1 : 0);
