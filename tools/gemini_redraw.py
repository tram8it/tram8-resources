#!/usr/bin/env python3
"""Redraw a product packshot with the Gemini API from 1-3 reference images (RUBRIC v12-v17).

    # generate a candidate (raw output + normalised candidate.webp in work/gemini/<id>/)
    python3 tools/gemini_redraw.py gen <product-dir>... [--ref PATH|URL ...] [--limit N]
            [--note "extra instruction"] [--model M] [--size 1K|2K] [--dry-run]

    # ask Gemini to correct the latest attempt (RUBRIC v12: max 2 fixes per product)
    python3 tools/gemini_redraw.py fix <product-dir> --instruction "the weight must read 60g" [--dry-run]

    # after LOOKING at the candidate: write image.webp + meta.json (status READY)
    python3 tools/gemini_redraw.py accept <product-dir> --reference "BHX product photo (reference only)"
            [--reference-url URL] --diff "what differs from the real pack" [--attempt N]

References, in RUBRIC v12 order: distributor catalogue -> retailer photo (BHX, Lotte... reference
only, never published) -> current KiotViet / staff photo. Without --ref the files in
work/gemini/<id>/refs/ are used in name order (name them 1-npp.jpg, 2-retail.jpg, 3-kiotviet.jpg);
if that folder is empty the current KiotViet image is downloaded as 3-kiotviet.

The API key is read from GEMINI_API_KEY and only ever sent in the request header; it is never
printed or written. Every call, its token usage and estimated cost go to stdout and to
work/gemini/<id>/log.json (work/ is git-ignored).

The script never decides whether an image is good: open candidate.webp next to the
references and compare flavour text, weight, logo and colours before running `accept`
(CLAUDE.md, hard rule 1).
"""
import argparse
import base64
import datetime as dt
import io
import json
import mimetypes
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "work" / "gemini"
API = "https://generativelanguage.googleapis.com/v1beta/interactions"

# Newest stable image model per ai.google.dev/gemini-api/docs/models (checked 2026-10-16).
DEFAULT_MODEL = "gemini-nano-banana-2.1"
RUBRIC_VERSION = "v18"
MAX_FIXES = 2

# USD, from ai.google.dev/gemini-api/docs/pricing (checked 2026-10-16). Used for estimates only.
PRICES = {
    "gemini-nano-banana-2.1": {"input_per_m": 1.50, "text_out_per_m": 7.50, "image": {"1K": 0.0336, "2K": 0.0504}},
    "gemini-3.1-flash-image": {"input_per_m": 0.50, "image": {"1K": 0.067, "2K": 0.101}},
    "gemini-3-pro-image": {"input_per_m": 2.00, "image": {"1K": 0.134, "2K": 0.134}},
    "gemini-3.1-flash-lite-image": {"input_per_m": 0.25, "image": {"1K": 0.0336}},
}
INPUT_TOKENS_PER_REF = 1100  # rough per-image input estimate when the API reports no usage

PROMPT = """Redraw this retail product as a clean e-commerce packshot.

Product (shop catalogue name): {name}
Barcode: {barcode}

Reference images are attached in priority order: the first is the most trustworthy for the
packaging design, later ones only fill in what the first does not show. Some references are
photos from other retailers or phone photos: use them ONLY to learn what the real pack looks like.

Output requirements:
- One single pack, front face, straight-on (no perspective, no tilt), centred, whole pack visible
  including top and bottom seals/caps; nothing cropped. The pack takes about 80% of the canvas
  height with clean white margin on every side.
- Render it flat and clean like the printed packaging design file: no wrinkles, no glare or shine
  spots, no reflections, no fingers, no shelf, no props, no extra packs.
- Pure white background (#FFFFFF), square 1:1 canvas, soft neutral shadow at most.
- Copy all large text on the pack EXACTLY as in the references: brand logo, product name,
  flavour, net weight. Keep the language and spelling of the pack (Vietnamese diacritics,
  Korean, etc.). Do not invent, translate or add any text, badges, numbers or weights that are
  not on the real pack. If a small line of text is unreadable, render it as small, unreadable
  print rather than making up words. Never invent numbers: weights, kcal, nutrition percentages,
  dates, phone numbers and e-mails must either be copied from a reference where they are
  readable or stay illegible.
- Keep the real pack colours, logo shapes and illustration layout.
- Remove anything that is not part of the printed pack: retailer watermarks, price tags,
  promotion flags/stickers, shop logos, barcode stickers stuck on the front.
- Use the regular everyday pack design, not a limited edition (World Cup, Tet, festival,
  football, seasonal) even if a reference shows one.
{note}"""

FIX_PROMPT = """The first image is your previous render of this product; the other images are the
references of the real pack. Keep everything that is already right and fix only this:
{instruction}
All other requirements still hold: straight-on single pack, flat clean print look, pure white
1:1 background, whole pack with white margin, text copied exactly from the real pack, no invented
text or numbers."""


# RUBRIC v18: ready-to-eat food sold by the piece (bánh bao, món hấp) shows the food, not the pack.
FOOD_PROMPT = """Make an appetizing studio food photo of this product itself, NOT of its packaging.

Product (shop catalogue name): {name}

The attached images are photos of the product's pack. Use them ONLY to learn what the food looks
like (shape, colour, decoration of the bun) and what the filling is (from the food picture and the
name on the pack). Never draw the pack, its film, tray, label or any text.

Output requirements:
- One whole piece and, next to it, one piece cut in half showing the filling clearly. For a
  character-shaped bun (animal face etc.), show the whole shaped bun from the front with its face,
  and the half showing the filling. A plain bun with no filling: one whole bun and one torn open.
- The filling must match the product exactly: {filling}. Do not add ingredients that are not in it.
- Freshly steamed look: soft, slightly glossy dough, a light wisp of steam at most. Realistic, not
  cartoon. Soft natural studio light, gentle shadow.
- Pure white background (#FFFFFF), square 1:1 canvas, food about 75% of the canvas width, centred,
  whole food visible with white margin. NO plate, board or cloth: the buns sit directly
  on the white background with a soft shadow.
- No text, no logos, no labels, no packaging, no hands, no props.
{note}"""

FOOD_FIX_PROMPT = """The first image is your previous food photo of this product; the other images are
photos of its pack, for reference only. Keep everything that is already right and fix only this:
{instruction}
All other requirements still hold: the food itself (no pack, no text, no logo), one whole piece and
one cut in half showing the filling, no plate, pure white 1:1 background with margin, realistic and
appetizing."""


class ApiError(Exception):
    pass


def die(msg):
    raise SystemExit(f"error: {msg}")


def load_meta(product_dir: Path) -> dict:
    meta_path = product_dir / "meta.json"
    if not meta_path.exists():
        die(f"{meta_path} not found")
    return json.loads(meta_path.read_text(encoding="utf-8"))


def work_dir(meta: dict) -> Path:
    d = WORK / str(meta["kiotProductId"])
    d.mkdir(parents=True, exist_ok=True)
    return d


def read_log(wdir: Path) -> dict:
    p = wdir / "log.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"attempts": []}


def write_log(wdir: Path, log: dict):
    (wdir / "log.json").write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")


def fetch(url: str) -> bytes:
    r = requests.get(url, timeout=60, headers={"User-Agent": "Mozilla/5.0 tram8-resources"})
    r.raise_for_status()
    return r.content


def as_png_part(data: bytes) -> dict:
    """Re-encode any input (webp, jpeg...) to PNG, capped at 2048px, as an API image part."""
    img = Image.open(io.BytesIO(data))
    img = img.convert("RGBA") if img.mode in ("RGBA", "LA", "P") else img.convert("RGB")
    img.thumbnail((2048, 2048))
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return {"type": "image", "mime_type": "image/png", "data": base64.b64encode(buf.getvalue()).decode()}


def resolve_refs(meta: dict, wdir: Path, refs: list) -> list:
    """Return [(label, bytes)] in priority order."""
    out = []
    if refs:
        for r in refs:
            out.append((r, fetch(r) if r.startswith(("http://", "https://")) else Path(r).read_bytes()))
        return out
    rdir = wdir / "refs"
    rdir.mkdir(exist_ok=True)
    files = sorted(p for p in rdir.iterdir() if p.is_file())
    if not files:
        url = (meta.get("current") or {}).get("imageUrl")
        if not url:
            return []
        ext = Path(url.split("?")[0]).suffix or ".jpg"
        p = rdir / f"3-kiotviet{ext}"
        p.write_bytes(fetch(url))
        files = [p]
    return [(str(p.relative_to(ROOT)), p.read_bytes()) for p in files]


def find_image(node):
    """Return (mime, base64) of the last image block anywhere in the response."""
    found = None
    if isinstance(node, dict):
        if node.get("type") == "image" and node.get("data"):
            found = (node.get("mime_type", "image/png"), node["data"])
        for k, v in node.items():
            if k == "summary":  # interim thought images are not the answer
                continue
            hit = find_image(v)
            if hit:
                found = hit
    elif isinstance(node, list):
        for v in node:
            hit = find_image(v)
            if hit:
                found = hit
    return found


def redact(node):
    """Copy of the response with base64 payloads shortened, kept for debugging the API shape."""
    if isinstance(node, dict):
        return {k: (f"<{len(v)} chars>" if k in ("data", "signature") and isinstance(v, str) else redact(v)) for k, v in node.items()}
    if isinstance(node, list):
        return [redact(v) for v in node]
    return node


def find_text(node) -> str:
    texts = []
    for step in (node.get("steps") or []):
        if step.get("type") == "model_output":
            texts += [c.get("text", "") for c in step.get("content", []) if c.get("type") == "text"]
    return " ".join(t for t in texts if t).strip()


def estimate_cost(model: str, size: str, n_refs: int, usage: dict) -> float:
    price = PRICES.get(model)
    if not price:
        return 0.0
    usage = usage or {}
    in_tokens = usage.get("total_input_tokens") or (300 + n_refs * INPUT_TOKENS_PER_REF)
    # thinking and text output are billed at the text rate on top of the per-image price
    text_out = usage.get("total_thought_tokens", 0) + sum(
        m.get("tokens", 0) for m in usage.get("output_tokens_by_modality", []) if m.get("modality") == "text")
    return round(in_tokens / 1e6 * price["input_per_m"] + text_out / 1e6 * price.get("text_out_per_m", 0)
                 + price["image"].get(size, price["image"]["1K"]), 4)


def call_api(model: str, size: str, prompt: str, images: list) -> dict:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        die("GEMINI_API_KEY is not set in this environment")
    body = {
        "model": model,
        "input": [{"type": "text", "text": prompt}] + [as_png_part(b) for b in images],
        "response_format": {"type": "image", "aspect_ratio": "1:1", "image_size": size},
    }
    for wait in (5, 20, 60, None):
        r = requests.post(API, json=body, timeout=300,
                          headers={"x-goog-api-key": key, "Content-Type": "application/json"})
        if r.status_code not in (429, 500, 502, 503, 504) or wait is None:
            break
        print(f"Gemini API HTTP {r.status_code}, retrying in {wait}s")
        time.sleep(wait)
    if r.status_code != 200:
        try:
            err = r.json()
            if isinstance(err, list):  # e.g. HTTP 402 when prepaid credit is used up
                err = err[0] if err else {}
            msg = err.get("error", {}).get("message", "") or r.text[:300]
        except (ValueError, AttributeError):
            msg = r.text[:300]
        raise ApiError(f"Gemini API HTTP {r.status_code}: {msg}"
                       + (" (often a watermark/logo-removal request on a retailer photo: drop that"
                          " reference or the removal wording)" if "safety" in msg.lower() else ""))
    return r.json()


def normalise(raw: Path, out: Path) -> dict:
    res = subprocess.run([sys.executable, str(ROOT / "tools" / "make_image.py"), str(raw), str(out)],
                         capture_output=True, text=True)
    if res.returncode != 0:
        die(f"make_image.py failed: {res.stdout}{res.stderr}")
    return json.loads(res.stdout)


def compare_sheet(images: list, raw: Path, out: Path, h: int = 700):
    """References, the render, and the render's bottom third at 2x (where weights and kcal live)
    side by side, so one image shows everything to check by eye."""
    tiles = []
    for b in images:
        im = Image.open(io.BytesIO(b)).convert("RGB")
        tiles.append(im.resize((max(1, round(im.width * h / im.height)), h)))
    render = Image.open(raw).convert("RGB")
    tiles.append(render.resize((h, h)))
    w, rh = render.size
    zoom = render.crop((0, rh * 2 // 3, w, rh))
    tiles.append(zoom.resize((round(zoom.width * h / zoom.height), h)))
    sheet = Image.new("RGB", (sum(t.width for t in tiles) + 12 * (len(tiles) - 1), h), "#888")
    x = 0
    for t in tiles:
        sheet.paste(t, (x, 0))
        x += t.width + 12
    sheet.thumbnail((3000, h))
    sheet.save(out, quality=88)


def run_attempt(meta, wdir, log, model, size, prompt, images, labels, kind, dry_run, style="pack"):
    n = len(log["attempts"]) + 1
    print(f"--- {meta['kiotProductId']} {meta['name']} · attempt {n} ({kind}) · {model} {size}")
    print(f"refs: {', '.join(labels) or '(none)'}")
    if dry_run:
        print(prompt)
        print(f"estimated cost: ${estimate_cost(model, size, len(images), {}):.4f} (dry run, no call)")
        return None
    try:
        resp = call_api(model, size, prompt, images)
    except ApiError as err:
        print(f"{meta['kiotProductId']}: {err}")
        return None
    (wdir / f"attempt-{n}.response.json").write_text(json.dumps(redact(resp), indent=1), encoding="utf-8")
    hit = find_image(resp)
    usage = resp.get("usage") or {}
    cost = estimate_cost(model, size, len(images), usage)
    entry = {"n": n, "kind": kind, "style": style, "model": model, "size": size, "at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
             "interactionId": resp.get("id"), "status": resp.get("status"), "refs": labels,
             "usage": usage, "estCostUsd": cost, "text": find_text(resp)[:500], "prompt": prompt}
    if hit:
        ext = mimetypes.guess_extension(hit[0]) or ".png"
        raw = wdir / f"attempt-{n}{ext}"
        raw.write_bytes(base64.b64decode(hit[1]))
        cand = wdir / f"attempt-{n}.webp"
        info = normalise(raw, cand)
        (wdir / "candidate.webp").write_bytes(cand.read_bytes())
        sheet = wdir / f"compare-{n}.jpg"
        compare_sheet(images, raw, sheet)
        entry.update({"raw": raw.name, "candidate": cand.name, "compare": sheet.name, "warnings": info.get("warnings", [])})
        print(f"raw: {raw.relative_to(ROOT)} · candidate: {cand.relative_to(ROOT)} · warnings: {info.get('warnings') or 'none'}")
        print(f"compare: {sheet.relative_to(ROOT)} (open it: references | render | render bottom third zoomed)")
    else:
        print(f"no image returned (status {resp.get('status')}): {entry['text'][:200]}")
    print(f"estimated cost: ${cost:.4f} · usage: {json.dumps(usage)[:200]}")
    log["attempts"].append(entry)
    write_log(wdir, log)
    return entry


def gen_one(a, d):
    meta = load_meta(Path(d))
    wdir = work_dir(meta)
    refs = resolve_refs(meta, wdir, a.ref)
    if not refs:
        print(f"skip {meta['kiotProductId']}: no reference image")
        return None
    if len(refs) > 3:
        print(f"skip {meta['kiotProductId']}: {len(refs)} references, use at most 3")
        return None
    note = f"\nAdditional instruction: {a.note}" if a.note else ""
    if a.style == "food":
        if not a.filling:
            print(f"skip {meta['kiotProductId']}: --style food needs --filling")
            return None
        prompt = FOOD_PROMPT.format(name=meta.get("fullName") or meta["name"], filling=a.filling, note=note)
    else:
        prompt = PROMPT.format(name=meta.get("fullName") or meta["name"], barcode=meta.get("barcode") or "-", note=note)
    log = read_log(wdir)
    return run_attempt(meta, wdir, log, a.model, a.size, prompt, [b for _, b in refs],
                       [l for l, _ in refs], "gen", a.dry_run, style=a.style)


def cmd_gen(a):
    dirs = a.product_dirs[: a.limit]
    if (a.note or a.filling) and len(dirs) > 1:
        die("--note is product-specific; pass one product directory with it")
    with ThreadPoolExecutor(max_workers=max(1, a.jobs)) as pool:
        entries = list(pool.map(lambda d: gen_one(a, d), dirs))
    done = [e for e in entries if e]
    if len(a.product_dirs) > a.limit:
        print(f"limit {a.limit} reached: {len(a.product_dirs) - a.limit} products not processed")
    print(f"=== API calls: {len(done)} · estimated cost: ${sum(e['estCostUsd'] for e in done):.4f}")


def cmd_fix(a):
    meta = load_meta(Path(a.product_dir))
    wdir = work_dir(meta)
    log = read_log(wdir)
    done = [e for e in log["attempts"] if e.get("candidate")]
    if not done:
        die("no previous attempt to fix; run gen first")
    last_gen = max((i for i, e in enumerate(log["attempts"]) if e["kind"] == "gen"), default=-1)
    fixes = sum(1 for e in log["attempts"][last_gen + 1:] if e["kind"] == "fix")
    if fixes >= MAX_FIXES and not a.force:
        die(f"already {fixes} fixes (RUBRIC v12 limit {MAX_FIXES}); drop it or pass --force with a reason")
    last = done[-1]
    refs = resolve_refs(meta, wdir, a.ref)
    prev = (wdir / last["raw"]).read_bytes()
    prompt = (FOOD_FIX_PROMPT if last.get("style") == "food" else FIX_PROMPT).format(instruction=a.instruction)
    model = a.model or last["model"]
    e = run_attempt(meta, wdir, log, model, a.size or last["size"], prompt,
                    [prev] + [b for _, b in refs], [f"attempt-{last['n']}"] + [l for l, _ in refs],
                    "fix", a.dry_run, style=last.get("style", "pack"))
    print(f"=== API calls: {0 if e is None else 1} · estimated cost: ${0 if e is None else e['estCostUsd']:.4f}")


def cmd_accept(a):
    pdir = Path(a.product_dir)
    meta = load_meta(pdir)
    wdir = work_dir(meta)
    log = read_log(wdir)
    done = [e for e in log["attempts"] if e.get("candidate")]
    pick = next((e for e in done if e["n"] == a.attempt), None) if a.attempt else (done[-1] if done else None)
    if not pick:
        die("no such attempt")
    (pdir / "image.webp").write_bytes((wdir / pick["candidate"]).read_bytes())
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    source = {"aiGenerated": True, "tool": "Gemini API", "model": pick["model"],
              "generatedAt": pick["at"][:10],
              "style": "food photo, whole + cut showing filling (v18)" if pick.get("style") == "food"
              else "flat clean packaging render (v17)",
              "reference": a.reference}
    if a.reference_url:
        source["referenceUrl"] = a.reference_url
    meta["image"] = {"decision": "REPLACE",
                     "reason": (f"{a.reason} → ảnh món ăn Gemini vẽ từ ảnh bao bì (v18: món hấp bán lẻ hiện cái bánh và nhân); ảnh minh hoạ. Khác hàng thật: {a.diff}"
                                if pick.get("style") == "food" else
                                f"{a.reason} → Gemini vẽ lại từ ảnh mẫu (v12–v15); đã so chữ/logo với mẫu. Khác gói thật: {a.diff}"),
                     "source": source, "rubricVersion": RUBRIC_VERSION}
    meta["status"] = "READY"
    meta["question"] = None
    meta["history"] = meta.get("history", []) + [{
        "at": now, "by": "ai", "status": "READY",
        "note": f"Gemini API redraw (attempt {pick['n']}, {pick['model']}), checked by eye against references"}]
    (pdir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"accepted attempt {pick['n']} → {pdir / 'image.webp'} · status READY")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("gen")
    g.add_argument("product_dirs", nargs="+")
    g.add_argument("--ref", action="append", default=[], help="reference image path/URL, priority order, max 3")
    g.add_argument("--note", default="")
    g.add_argument("--style", default="pack", choices=["pack", "food"],
                   help="pack = packaging render (default); food = the food itself, whole + cut (RUBRIC v18)")
    g.add_argument("--filling", default="", help="--style food: what the filling is, e.g. 'pork, quail egg, Chinese sausage'")
    g.add_argument("--limit", type=int, default=10, help="max products per run (default 10)")
    g.add_argument("--model", default=DEFAULT_MODEL)
    g.add_argument("--size", default="2K", choices=["1K", "2K"])
    g.add_argument("--jobs", type=int, default=4, help="parallel API calls (default 4)")
    g.add_argument("--dry-run", action="store_true")
    f = sub.add_parser("fix")
    f.add_argument("product_dir")
    f.add_argument("--instruction", required=True)
    f.add_argument("--ref", action="append", default=[])
    f.add_argument("--model")
    f.add_argument("--size", choices=["1K", "2K"])
    f.add_argument("--force", action="store_true")
    f.add_argument("--dry-run", action="store_true")
    c = sub.add_parser("accept")
    c.add_argument("product_dir")
    c.add_argument("--attempt", type=int)
    c.add_argument("--reference", required=True, help="what the references were, e.g. 'ảnh BHX (chỉ làm mẫu)'")
    c.add_argument("--reference-url")
    c.add_argument("--reason", default="I3/I4: ảnh hiện có không đạt, không có ảnh hãng/NPP")
    c.add_argument("--diff", required=True, help="differences from the real pack, or 'không thấy khác biệt'")
    a = p.parse_args()
    {"gen": cmd_gen, "fix": cmd_fix, "accept": cmd_accept}[a.cmd](a)


if __name__ == "__main__":
    main()
