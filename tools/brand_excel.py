"""Cut one import batch out of a KiotViet product export, changing only the
brand cell (and the weight, set to 0: owner, 19/10/2026) of the chosen rows.

    python3 -I tools/brand_excel.py <export.xlsx> <snapshot.json> <de-xuat-tung-sp.csv> \
        --ids 64865789,64865576 | --take 50 [--skip 8] --out work/excel/lo-02.xlsx

The workbook is edited as XML inside the zip: every byte of every other cell,
style and part is copied as is (the 19/10 test showed a re-saved workbook is
not needed and only adds risk). Rows outside the batch are dropped and the
kept rows renumbered.

A row is left out, and listed, when the export no longer matches KiotViet now
(name, code, price, VAT or brand differ from the snapshot, or the product was
modified after the export was taken): importing it would write stale values
back over a newer edit.

Writes <out>.xlsx, <out>.csv (plan for brand-diff.mjs) and <out>.md (cell-by-
cell list of what changes). Standard library only.
"""
import argparse
import csv
import json
import re
import sys
import zipfile
from datetime import datetime, timedelta, timezone
from xml.sax.saxutils import escape, unescape

NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"

ap = argparse.ArgumentParser()
ap.add_argument("export")
ap.add_argument("snapshot")
ap.add_argument("proposals")
ap.add_argument("--ids")
ap.add_argument("--all", action="store_true", help="every product whose brand changes or whose weight (or a unit's) is not 0")
ap.add_argument("--take", type=int)
ap.add_argument("--skip", type=int, default=0)
ap.add_argument("--out", required=True)
args = ap.parse_args()

snap = json.load(open(args.snapshot, encoding="utf-8"))
products = {str(p["id"]): p for p in snap["products"]}
by_code = {p["code"]: p for p in snap["products"]}
proposals = {r["kiotProductId"]: r for r in csv.DictReader(open(args.proposals, encoding="utf-8-sig"))}

zin = zipfile.ZipFile(args.export)
names = zin.namelist()
sheet_name = next(n for n in names if re.match(r"xl/worksheets/sheet\d+\.xml$", n))
table_names = [n for n in names if n.startswith("xl/tables/")]
sheet = zin.read(sheet_name).decode("utf-8")

# KiotViet names the export after the moment it was taken, in Vietnam time:
# Products_KV19102026-151623-362.xlsx = 19/10/2026 15:16:23.
m = re.search(r"KV(\d{2})(\d{2})(\d{4})-(\d{2})(\d{2})(\d{2})", args.export)
if not m:
    sys.exit("cannot read the export time from the file name (Products_KVddmmyyyy-hhmmss…)")
d, mo, y, h, mi, s = map(int, m.groups())
exported_at = datetime(y, mo, d, h, mi, s, tzinfo=timezone(timedelta(hours=7)))

rows = re.findall(r"<row\b[^>]*>.*?</row>|<row\b[^>]*/>", sheet, re.S)
row_re = re.compile(r'<row\b[^>]*\br="(\d+)"')
cell_re = re.compile(r'<c r="([A-Z]+)(\d+)"([^>]*?)(?:/>|>(.*?)</c>)', re.S)


def cells(row_xml):
    out = {}
    for col, _r, attrs, inner in cell_re.findall(row_xml):
        v = re.search(r"<v>(.*?)</v>", inner or "", re.S)
        t = re.search(r"<t[^>]*>(.*?)</t>", inner or "", re.S)
        out[col] = (attrs, (v or t).group(1) if (v or t) else None)
    return out


header = cells(rows[0])
col_of = {}
for col, (_a, val) in header.items():
    col_of[(val or "").strip()] = col
for need in ("Mã hàng", "Tên hàng", "Thương hiệu", "Trọng lượng", "Giá bán sau thuế", "VAT hàng bán (%)"):
    if need not in col_of:
        sys.exit(f"export has no column '{need}'")

# Which products go into this batch, in proposal order.
want = []
if args.ids:
    want = args.ids.split(",")
elif args.all:
    heavy = {str(p["masterUnitId"]) for p in snap["products"] if p.get("masterUnitId") and (p.get("weight") or 0) > 0}
    want = [
        pid
        for pid, r in proposals.items()
        if r["change"] != "giữ" or (products.get(pid, {}).get("weight") or 0) > 0 or pid in heavy
    ]
else:
    order = [r for r in proposals.values() if r["change"] != "giữ"]
    want = [r["kiotProductId"] for r in order][args.skip : args.skip + (args.take or 0)]

data_rows = {}
for row in rows[1:]:
    c = cells(row)
    code = (c.get(col_of["Mã hàng"]) or (None, None))[1]
    if code:
        data_rows[code] = row


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


kept, skipped, changes, plan = [], [], [], []
for pid in want:
    p = products.get(pid)
    r = proposals.get(pid)
    if not p or not r:
        skipped.append(f"{pid}: không có trong bản chụp/đề xuất")
        continue
    row = data_rows.get(p["code"])
    if row is None:
        skipped.append(f"{p['code']} {p['name']}: không có trong file xuất")
        continue
    c = cells(row)
    get = lambda name: (c.get(col_of[name]) or (None, None))[1]
    brand_now = (p.get("brand") or {}).get("name") or ""
    problems = []
    if (get("Tên hàng") or "") != escape(p["name"]):
        problems.append("tên khác")
    if num(get("Giá bán sau thuế")) is not None and abs(num(get("Giá bán sau thuế")) - float(p.get("priceAfterTax") or p.get("basePrice") or 0)) > 0.5:
        problems.append("giá sau thuế khác")
    if (get("Thương hiệu") or "") != escape(brand_now):
        problems.append("thương hiệu khác")
    if brand_now != r["current"]:
        problems.append("đề xuất lập trên dữ liệu cũ")
    mod = p.get("modifiedAt")
    if mod:
        modified = datetime.fromisoformat(mod[:19]).replace(tzinfo=timezone(timedelta(hours=7)))
        if modified > exported_at:
            problems.append(f"sửa lúc {mod[:19]}, sau khi xuất file")
    if problems:
        skipped.append(f"{p['code']} {p['name']}: {', '.join(problems)}")
        continue
    kept.append((pid, row, r))

if not kept:
    sys.exit("nothing to write:\n" + "\n".join(skipped))


def set_cell(row_xml, col, new_value, numeric):
    """Replace one cell's value, keeping its style attribute."""
    pat = re.compile(r'<c r="%s(\d+)"([^>]*?)(?:/>|>.*?</c>)' % col, re.S)
    m = pat.search(row_xml)
    if not m:
        raise SystemExit(f"row has no cell {col}")
    attrs = re.sub(r'\s*t="[^"]*"', "", m.group(2))
    if numeric:
        cell = f'<c r="{col}{m.group(1)}"{attrs}><v>{new_value}</v></c>'
    elif new_value == "":
        cell = f'<c r="{col}{m.group(1)}"{attrs}/>'
    else:
        cell = f'<c r="{col}{m.group(1)}"{attrs} t="str"><v>{escape(new_value)}</v></c>'
    return row_xml[: m.start()] + cell + row_xml[m.end() :]


def renumber(row_xml, n):
    row_xml = re.sub(r'(<row\b[^>]*\br=")\d+(")', rf"\g<1>{n}\2", row_xml, count=1)
    return re.sub(r'(<c r="[A-Z]+)\d+(")', rf"\g<1>{n}\2", row_xml)


out_rows = [rows[0]]
for i, (pid, row, r) in enumerate(kept, start=2):
    c = cells(row)
    old_brand = (c.get(col_of["Thương hiệu"]) or (None, None))[1] or ""
    old_weight = (c.get(col_of["Trọng lượng"]) or (None, None))[1] or ""
    new = set_cell(row, col_of["Thương hiệu"], r["proposed"], False)
    new = set_cell(new, col_of["Trọng lượng"], "0", True)
    out_rows.append(renumber(new, i))
    changes.append((products[pid]["code"], products[pid]["name"], unescape(old_brand), r["proposed"], old_weight))
    if r["proposed"] != r["current"]:
        plan.append({"kind": "product", "kiotProductId": pid, "brandId": "", "from": r["current"], "to": r["proposed"]})

body = "".join(out_rows)
start = sheet.index(rows[0])
end = sheet.rindex(rows[-1]) + len(rows[-1])
last_col = max(col_of.values(), key=lambda c: (len(c), c))
new_sheet = sheet[:start] + body + sheet[end:]
new_sheet = re.sub(r'<dimension ref="[^"]*"/>', f'<dimension ref="A1:{last_col}{len(out_rows)}"/>', new_sheet)

zout = zipfile.ZipFile(args.out, "w", zipfile.ZIP_DEFLATED)
for info in zin.infolist():
    data = zin.read(info.filename)
    if info.filename == sheet_name:
        data = new_sheet.encode("utf-8")
    elif info.filename in table_names:
        t = data.decode("utf-8")
        t = re.sub(r'(<table\b[^>]*\bref="A1:[A-Z]+)\d+(")', rf"\g<1>{len(out_rows)}\2", t)
        t = re.sub(r'(<autoFilter\b[^>]*\bref="A1:[A-Z]+)\d+(")', rf"\g<1>{len(out_rows)}\2", t)
        data = t.encode("utf-8")
    zout.writestr(info, data)
zout.close()

base = re.sub(r"\.xlsx$", "", args.out)
with open(base + ".csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, ["kind", "kiotProductId", "brandId", "from", "to"])
    w.writeheader()
    w.writerows(plan)
with open(base + ".md", "w", encoding="utf-8") as f:
    f.write(f"# {args.out}\n\nFile xuất lúc {exported_at:%d/%m/%Y %H:%M:%S} · bản chụp {snap['takenAt']}\n\n")
    f.write(f"{len(kept)} SP trong lô · {len(skipped)} SP bị loại\n\n| Mã | Tên | Thương hiệu | Trọng lượng |\n|---|---|---|---|\n")
    for code, name, ob, nb, ow in changes:
        f.write(f"| {code} | {name} | {ob or '(trống)'} → {nb or '(trống)'} | {ow or '0'} → 0 |\n")
    if skipped:
        f.write("\n## Bị loại\n" + "".join(f"- {s}\n" for s in skipped))
print(f"{len(kept)} rows -> {args.out}; {len(skipped)} skipped")
for s in skipped:
    print("  skip:", s)
