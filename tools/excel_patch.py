"""Add rows from a KiotViet export to a batch file made by brand_excel.py, and set
cells in it, keeping every other byte of the export.

    python3 -I tools/excel_patch.py <export.xlsx> <batch.xlsx> <edits.csv> --out <new.xlsx>

edits.csv: code,column,proposed — `column` is an export header ("Nhóm hàng(3 Cấp)",
"Thuộc tính", …). A product not yet in the batch is copied from the export first.
Category paths are written "A > B > C" and stored as KiotViet's "A>>B>>C". Prints each
change as old → new. Standard library only.
"""
import argparse
import csv
import re
import zipfile
from xml.sax.saxutils import escape, unescape

ap = argparse.ArgumentParser()
ap.add_argument("export")
ap.add_argument("batch")
ap.add_argument("edits")
ap.add_argument("--out", required=True)
args = ap.parse_args()

cell_re = re.compile(r'<c r="([A-Z]+)(\d+)"([^>]*?)(?:/>|>(.*?)</c>)', re.S)


def sheet_of(path):
    z = zipfile.ZipFile(path)
    name = sorted(n for n in z.namelist() if n.startswith("xl/worksheets/sheet"))[0]
    strings = []
    if "xl/sharedStrings.xml" in z.namelist():
        xml = z.read("xl/sharedStrings.xml").decode("utf-8")
        strings = [unescape("".join(re.findall(r"<t[^>]*>(.*?)</t>", si, re.S))) for si in re.findall(r"<si>(.*?)</si>", xml, re.S)]
    return z, name, z.read(name).decode("utf-8"), strings


def values(row, strings):
    out = {}
    for col, _r, attrs, inner in cell_re.findall(row):
        v = re.search(r"<v>(.*?)</v>", inner or "", re.S)
        t = re.search(r"<t[^>]*>(.*?)</t>", inner or "", re.S)
        raw = (v or t).group(1) if (v or t) else ""
        out[col] = strings[int(raw)] if 't="s"' in attrs and raw else unescape(raw)
    return out


def set_cell(row, col, value):
    m = re.search(r'<c r="%s(\d+)"([^>]*?)(?:/>|>.*?</c>)' % col, row, re.S)
    if not m:
        raise SystemExit(f"row has no cell {col}")
    attrs = re.sub(r'\s*t="[^"]*"', "", m.group(2))
    cell = f'<c r="{col}{m.group(1)}"{attrs} t="str"><v>{escape(value)}</v></c>' if value else f'<c r="{col}{m.group(1)}"{attrs}/>'
    return row[: m.start()] + cell + row[m.end():]


def renumber(row, n):
    row = re.sub(r'(<row\b[^>]*\br=")\d+(")', rf"\g<1>{n}\2", row, count=1)
    return re.sub(r'(<c r="[A-Z]+)\d+(")', rf"\g<1>{n}\2", row)


_, _, export_xml, export_strings = sheet_of(args.export)
zb, sheet_name, batch_xml, batch_strings = sheet_of(args.batch)
export_rows = re.findall(r"<row\b[^>]*>.*?</row>", export_xml, re.S)
batch_rows = re.findall(r"<row\b[^>]*>.*?</row>", batch_xml, re.S)
header = {v: k for k, v in values(export_rows[0], export_strings).items()}
code_col = header["Mã hàng"]
by_code = {values(r, export_strings).get(code_col): r for r in export_rows[1:]}

rows = list(batch_rows)
index = {values(r, batch_strings).get(code_col): i for i, r in enumerate(rows) if i}
for e in csv.DictReader(open(args.edits, encoding="utf-8-sig")):
    code, column, value = e["code"], e["column"], e["proposed"]
    if column == "Nhóm hàng(3 Cấp)":
        value = ">>".join(value.split(" > "))
    if code not in index:
        if code not in by_code:
            raise SystemExit(f"{code} is not in the export")
        rows.append(renumber(by_code[code], len(rows) + 1))
        index[code] = len(rows) - 1
        strings = export_strings
    i = index[code]
    old = values(rows[i], export_strings if rows[i] is by_code.get(code) or i >= len(batch_rows) else batch_strings).get(header[column], "")
    rows[i] = set_cell(rows[i], header[column], value)
    print(f"{code} {column}: {old!r} → {value!r}")

start = batch_xml.index(batch_rows[0])
end = batch_xml.rindex(batch_rows[-1]) + len(batch_rows[-1])
last_col = max(header.values(), key=lambda c: (len(c), c))
xml = batch_xml[:start] + "".join(rows) + batch_xml[end:]
xml = re.sub(r'<dimension ref="[^"]*"/>', f'<dimension ref="A1:{last_col}{len(rows)}"/>', xml)
zout = zipfile.ZipFile(args.out, "w", zipfile.ZIP_DEFLATED)
for info in zb.infolist():
    data = zb.read(info.filename)
    if info.filename == sheet_name:
        data = xml.encode("utf-8")
    elif info.filename.startswith("xl/tables/"):
        t = data.decode("utf-8")
        t = re.sub(r'(<(?:table|autoFilter)\b[^>]*\bref="A1:[A-Z]+)\d+(")', rf"\g<1>{len(rows)}\2", t)
        data = t.encode("utf-8")
    zout.writestr(info, data)
zout.close()
print(f"{len(rows) - 1} rows -> {args.out}")
