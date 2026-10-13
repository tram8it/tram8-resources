/**
 * Push APPROVED products of one category to the Hub and on to KiotViet
 * (tram8-hub docs/24 + docs/25).
 *
 *   NODE_USE_ENV_PROXY=1 node tools/push-kiotviet.mjs <category-dir|id>            # dry run
 *   NODE_USE_ENV_PROXY=1 node tools/push-kiotviet.mjs <category> --only <id> --live
 *   NODE_USE_ENV_PROXY=1 node tools/push-kiotviet.mjs <category> --live
 *
 * TRAM8_API_TOKEN needs products:read, products:content:write and
 * products:kiotviet:write. NODE_USE_ENV_PROXY=1 only behind an HTTPS proxy.
 *
 * Dry run (default) writes nothing anywhere: it asks the Hub what KiotViet
 * would change. --live first stores image + description in the Hub (content
 * API), then pushes name, net weight, brand, description and image to KiotViet,
 * and marks the product UPLOADED. The run stops at the first product where
 * KiotViet changed something it was not asked to (unexpectedChanges) — that is
 * the e-invoice-name check the owner asked for.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { ROOT, loadAllProducts, writeJson } from "./lib.mjs";

const args = process.argv.slice(2);
const category = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--only");
const live = args.includes("--live");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const BASE = (process.env.TRAM8_HUB_URL ?? "https://hub.tram8.vn").replace(/\/+$/, "");
const token = process.env.TRAM8_API_TOKEN;
if (!category || !token) {
  console.error("usage: TRAM8_API_TOKEN=… node tools/push-kiotviet.mjs <category> [--only <kiotProductId>] [--live]");
  process.exit(2);
}

async function api(method, path, body) {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  if (!res.ok) throw Object.assign(new Error(`${method} ${path} -> ${res.status} ${json.error ?? ""} ${json.message ?? ""}`), { json });
  return json;
}

const products = (await loadAllProducts()).filter(
  (p) =>
    (p.categoryDir === category || p.categoryDir.startsWith(`${category}-`)) &&
    p.meta.status === "APPROVED" &&
    (!only || p.meta.kiotProductId === only),
);
if (!products.length) {
  console.error("Nothing to push: only APPROVED products are pushed (owner approval first).");
  process.exit(1);
}

const now = new Date().toISOString();
const log = [];
let stopped = false;
for (const p of products) {
  const m = p.meta;
  const id = m.kiotProductId;
  const descriptionPath = join(p.path, "description.md");
  const imagePath = join(p.path, "image.webp");
  const hasDescription = existsSync(descriptionPath);
  const hasImage = existsSync(imagePath);
  const entry = { kiotProductId: id, name: m.name, proposed: m.master ?? null };
  try {
    if (live && (hasDescription || hasImage)) {
      const body = {};
      if (hasDescription) body.description = (await readFile(descriptionPath, "utf8")).trim();
      if (hasImage) body.image = { mime: "image/webp", base64: (await readFile(imagePath)).toString("base64") };
      entry.content = await api("PUT", `/content/products/${id}`, body);
    }
    const current = live ? entry.content : await api("GET", `/content/products/${id}`);
    const push = {
      ...(m.master ? { name: m.master.name, weightGram: m.master.weightGram, brand: m.master.brand } : {}),
      // In a dry run the Hub may not hold the content yet; it is uploaded first on --live.
      ...(hasDescription && (live || current?.content?.description) ? { description: true } : {}),
      ...(hasImage && (live || current?.content?.image) ? { image: true } : {}),
      dryRun: !live,
    };
    entry.result = await api("POST", `/content/products/${id}/kiotviet`, push);
    if (!live && hasDescription && !current?.content?.description) entry.note = "description uploads on --live";
    if (!live && hasImage && !current?.content?.image) entry.note = [entry.note, "image uploads on --live"].filter(Boolean).join("; ");

    const unexpected = Object.keys(entry.result.unexpectedChanges ?? {});
    if (live) {
      m.status = "UPLOADED";
      m.uploaded = {
        at: now,
        imageHash: entry.content?.content?.image?.hash ?? null,
        kiotviet: entry.result.changes,
        unexpectedChanges: entry.result.unexpectedChanges,
      };
      m.history = [
        ...(m.history ?? []),
        {
          at: now,
          by: "ai",
          status: "UPLOADED",
          note: `pushed to KiotViet: ${Object.keys(entry.result.changes).join(", ") || "nothing changed"}${unexpected.length ? ` — UNEXPECTED: ${unexpected.join(", ")}` : ""}`,
        },
      ];
      await writeJson(join(p.path, "meta.json"), m);
    }
    const changed = Object.keys(entry.result.changes);
    console.log(`${live ? "LIVE" : "dry "} ${id} ${m.name} → ${changed.join(", ") || "(no change)"}${entry.note ? ` [${entry.note}]` : ""}`);
    if (unexpected.length) {
      console.error(`  ⚠ KiotViet also changed: ${unexpected.join(", ")} — stopping. Check this product in KiotViet.`);
      stopped = true;
    }
  } catch (err) {
    entry.error = err.message;
    console.error(`FAIL ${id} ${m.name}: ${err.message}`);
  }
  log.push(entry);
  if (stopped) break;
}

await mkdir(join(ROOT, "work"), { recursive: true });
const out = join(ROOT, "work", `push-${live ? "live" : "dry"}-${now.replace(/[:.]/g, "-")}.json`);
await writeFile(out, JSON.stringify(log, null, 2) + "\n");
const missingBrands = [...new Set(log.filter((e) => /brand_not_found/.test(e.error ?? "")).map((e) => e.proposed?.brand))];
if (missingBrands.length) console.log(`Brands to create in KiotViet first: ${missingBrands.join(", ")}`);
console.log(`log: ${out}${live ? "\nnext: node tools/status.mjs" : ""}`);
process.exit(log.some((e) => e.error) || stopped ? 1 : 0);
