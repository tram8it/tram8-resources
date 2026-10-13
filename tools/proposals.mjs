/**
 * Hand finished products to the Hub for the owner to review (tram8-hub docs/25).
 *
 *   node tools/proposals.mjs submit <category-dir|id> [--only <kiotProductId>]   # dry run: list what would be sent
 *   node tools/proposals.mjs submit <category-dir|id> [--only <id>] --send       # send to the Hub's review queue
 *   node tools/proposals.mjs sync                                               # read the owner's decisions back
 *
 * TRAM8_API_TOKEN: products:read + products:proposals:write. Behind an HTTPS
 * proxy (cloud sessions) prefix NODE_USE_ENV_PROXY=1.
 *
 * This never writes KiotViet: a proposal waits on the Hub's "Duyệt nội dung SP"
 * page until the owner applies or rejects it. `sync` then marks the product
 * UPLOADED (applied) or sends it back to IN_PROGRESS with the owner's note.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { loadAllProducts, writeJson } from "./lib.mjs";

const [command, ...rest] = process.argv.slice(2);
const flag = (name) => rest.includes(name);
const valueOf = (name) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : null);
const BASE = (process.env.TRAM8_HUB_URL ?? "https://hub.tram8.vn").replace(/\/+$/, "");
const token = process.env.TRAM8_API_TOKEN;
if (!token || !["submit", "sync"].includes(command)) {
  console.error(
    "usage: TRAM8_API_TOKEN=… node tools/proposals.mjs submit <category> [--only <id>] [--send]\n" +
      "       TRAM8_API_TOKEN=… node tools/proposals.mjs sync",
  );
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
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${json.error ?? ""} ${json.message ?? ""}`.trim());
  return json;
}

const now = new Date().toISOString();

if (command === "submit") {
  const category = rest.find((a, i) => !a.startsWith("--") && rest[i - 1] !== "--only");
  const only = valueOf("--only");
  const send = flag("--send");
  if (!category) {
    console.error("submit needs a category");
    process.exit(2);
  }
  const products = (await loadAllProducts()).filter(
    (p) =>
      (p.categoryDir === category || p.categoryDir.startsWith(`${category}-`)) &&
      p.meta.status === "READY" &&
      (!only || p.meta.kiotProductId === only),
  );
  if (!products.length) {
    console.error("Nothing to submit: only READY products are sent for review.");
    process.exit(1);
  }
  let failed = 0;
  for (const p of products) {
    const m = p.meta;
    const body = {};
    if (m.master?.name) body.name = m.master.name;
    if (m.master?.weightGram) body.weightGram = m.master.weightGram;
    if (m.master?.brand) body.brand = m.master.brand;
    const descriptionPath = join(p.path, "description.md");
    if (existsSync(descriptionPath)) body.description = (await readFile(descriptionPath, "utf8")).trim();
    const imagePath = join(p.path, "image.webp");
    if (existsSync(imagePath))
      body.image = { mime: "image/webp", base64: (await readFile(imagePath)).toString("base64") };
    body.note = [
      m.image?.reason && `Ảnh: ${m.image.reason}`,
      m.image?.source?.url && `Nguồn ảnh: ${m.image.source.url}`,
      m.description?.source?.url && `Nguồn mô tả: ${m.description.source.url}`,
      m.master?.reason,
    ]
      .filter(Boolean)
      .join("\n");
    const fields = Object.keys(body).filter((k) => k !== "note");
    if (!send) {
      console.log(`dry  ${m.kiotProductId} ${m.name} → ${fields.join(", ")}`);
      continue;
    }
    try {
      const result = await api("PUT", `/content/products/${m.kiotProductId}/proposal`, body);
      m.submitted = { at: now, fields, hubStatus: result.status };
      m.history = [...(m.history ?? []), { at: now, by: "ai", status: m.status, note: `submitted to Hub review: ${fields.join(", ")}` }];
      await writeJson(join(p.path, "meta.json"), m);
      console.log(`sent ${m.kiotProductId} ${m.name} → ${fields.join(", ")}`);
    } catch (err) {
      failed++;
      console.error(`FAIL ${m.kiotProductId} ${m.name}: ${err.message}`);
    }
  }
  if (!send) console.log(`${products.length} READY products. Add --send to put them in the Hub review queue.`);
  process.exit(failed ? 1 : 0);
}

// sync: read every decision back and record it.
const outcomes = new Map();
for (let cursor = null; ; ) {
  const page = await api("GET", `/content/proposals?limit=200${cursor ? `&cursor=${cursor}` : ""}`);
  for (const item of page.items) outcomes.set(item.kiotProductId, item);
  cursor = page.nextCursor;
  if (!cursor) break;
}
const counts = { APPLIED: 0, REJECTED: 0, FAILED: 0, PENDING: 0 };
for (const p of await loadAllProducts()) {
  const m = p.meta;
  const o = outcomes.get(m.kiotProductId);
  if (!o) continue;
  counts[o.status] = (counts[o.status] ?? 0) + 1;
  const seen = m.review?.reviewedAt === o.reviewedAt && m.review?.status === o.status;
  if (seen) continue;
  m.review = { status: o.status, reviewedBy: o.reviewedBy, reviewedAt: o.reviewedAt, note: o.reviewNote };
  if (o.status === "APPLIED") {
    m.status = "UPLOADED";
    m.uploaded = { at: o.reviewedAt, by: o.reviewedBy, kiotviet: o.applyResult?.changes ?? null, unexpectedChanges: o.applyResult?.unexpectedChanges ?? null };
    m.history = [...(m.history ?? []), { at: now, by: "owner", status: "UPLOADED", note: `applied on Hub by ${o.reviewedBy}${o.reviewNote ? `: ${o.reviewNote}` : ""}` }];
  } else if (o.status === "REJECTED") {
    m.status = "IN_PROGRESS";
    m.history = [...(m.history ?? []), { at: now, by: "owner", status: "IN_PROGRESS", note: `rejected on Hub by ${o.reviewedBy}: ${o.reviewNote}` }];
  } else if (o.status === "FAILED") {
    m.history = [...(m.history ?? []), { at: now, by: "owner", status: m.status, note: `apply failed on Hub: ${o.reviewNote}` }];
  } else continue;
  await writeJson(join(p.path, "meta.json"), m);
}
console.log(`Hub: ${counts.APPLIED} applied · ${counts.REJECTED} rejected · ${counts.FAILED} failed · ${counts.PENDING} waiting`);
console.log("next: node tools/status.mjs");
