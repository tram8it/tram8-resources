/** Shared helpers for the tools in this folder. No dependencies beyond Node 22. */
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const CATEGORIES_DIR = join(ROOT, "categories");

export const STATUSES = [
  "TODO",
  "NO_CHANGE",
  "ASK_OWNER",
  "IN_PROGRESS",
  "NEEDS_PHOTO",
  "READY",
  "APPROVED",
  "UPLOADED",
];
export const IMAGE_DECISIONS = ["KEEP", "CROP", "REPLACE", "ASK_OWNER"];
export const DESCRIPTION_DECISIONS = ["KEEP", "REWRITE", "WRITE_NEW", "ASK_OWNER"];

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.length > 1 || r[0] !== "");
  const keys = header.map((h) => h.replace(/^﻿/, ""));
  return body.map((r) => Object.fromEntries(keys.map((h, i) => [h, r[i] ?? ""])));
}

const csvCell = (value) => {
  const raw = value === null || value === undefined ? "" : String(value);
  // A cell starting like a formula would run in Excel/Sheets when the file is opened: keep it text.
  const s = /^[=+\-@\t\r]/.test(raw) && !/^-?\d+([.,]\d+)?$/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
/** BOM so Excel opens Vietnamese text correctly. */
export const toCsv = (rows, columns) =>
  "﻿" +
  [columns.join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))].join("\r\n") +
  "\r\n";

export function slug(text, max = 48) {
  const s = String(text ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return s || "x";
}

export const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

export async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(await readFile(path, "utf8"));
}

export const writeJson = (path, value) => writeFile(path, JSON.stringify(value, null, 2) + "\n");

/** Every product folder: { categoryDir, productDir, path, meta }. */
export async function loadAllProducts() {
  const out = [];
  if (!existsSync(CATEGORIES_DIR)) return out;
  for (const categoryDir of (await readdir(CATEGORIES_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()) {
    const base = join(CATEGORIES_DIR, categoryDir);
    for (const productDir of (await readdir(base, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()) {
      const path = join(base, productDir);
      const meta = await readJson(join(path, "meta.json"), null);
      if (meta) out.push({ categoryDir, productDir, path, meta });
    }
  }
  return out;
}

/** Problems that make a meta.json untrustworthy as the progress record. */
export function validateMeta(meta, path) {
  const problems = [];
  if (!STATUSES.includes(meta.status)) problems.push(`unknown status ${meta.status}`);
  const image = meta.image?.decision;
  const description = meta.description?.decision;
  if (image !== null && image !== undefined && !IMAGE_DECISIONS.includes(image))
    problems.push(`unknown image.decision ${image}`);
  if (description !== null && description !== undefined && !DESCRIPTION_DECISIONS.includes(description))
    problems.push(`unknown description.decision ${description}`);
  if (meta.status !== "TODO" && (!image || !description))
    problems.push("reviewed but image/description decision missing");
  if (meta.status === "NO_CHANGE" && (image !== "KEEP" || description !== "KEEP"))
    problems.push("NO_CHANGE requires both decisions KEEP");
  if (["READY", "APPROVED", "UPLOADED"].includes(meta.status)) {
    if (["CROP", "REPLACE"].includes(image) && !existsSync(join(path, "image.webp")))
      problems.push(`${meta.status} but image.webp missing`);
    if (["REWRITE", "WRITE_NEW"].includes(description) && !existsSync(join(path, "description.md")))
      problems.push(`${meta.status} but description.md missing`);
  }
  if (image === "REPLACE" && ["READY", "APPROVED", "UPLOADED"].includes(meta.status) && !meta.image?.source)
    problems.push("replaced image has no source (official URL or staff photo)");
  return problems;
}
