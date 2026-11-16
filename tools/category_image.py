#!/usr/bin/env python3
"""Category image: fan bouquet of 3-5 product cut-outs, transparent background.

  python3 tools/category_image.py <out-name> <heroId> <id2> <id3> [<id4> <id5>]   (run from tram8-resources)

First id = hero (centre, front). Others go out in pairs: 2,3 beside the hero, 4,5 outermost.
Writes reports/danh-muc/<out-name>.webp (lossless alpha) + .png, and a check sheet
(dark + pink + 56px/28px sizes) at work/<out-name>-check.jpg — open it and look.
"""
import sys, glob, os, subprocess
from PIL import Image, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join("work", "category-cutouts")
name, ids = sys.argv[1], sys.argv[2:]
os.makedirs(CACHE, exist_ok=True)
assert 3 <= len(ids) <= 5, "need 3-5 product ids"

def src(pid):
    p = glob.glob(f"categories/*/{pid}-*/image.webp")
    if not p: sys.exit(f"no image.webp for {pid}")
    return p[0]

def cutout(pid):
    out = os.path.join(CACHE, f"{pid}.png")
    if not os.path.exists(out):
        code = ("import sys\nfrom rembg import remove,new_session\nfrom PIL import Image,ImageFilter\n"
                "im=Image.open(sys.argv[1]).convert('RGB');o=remove(im,session=new_session('isnet-general-use'))\n"
                "a=o.getchannel('A').point(lambda v:255 if v>128 else 0).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1))\n"
                "o.putalpha(a);o.crop(o.getbbox()).save(sys.argv[2])\n")
        subprocess.run([sys.executable, "-I", "-c", code, src(pid), out], check=True)
    return Image.open(out)

def fit(im, h):  # scale by height, but cap width so wide items don't dominate
    r = h / im.height
    if im.width * r > h * 0.95: r = h * 0.95 / im.width
    return im.resize((max(1, round(im.width * r)), max(1, round(im.height * r))), Image.LANCZOS)

n = len(ids)
# (height, angle, dx, dy) per slot: hero, inner L/R, outer L/R
slots = {
    "hero": (660, 0, 0, 50),
    "inL": (720, -15, -115, -55), "inR": (700, 15, 115, -55),
    "outL": (620, -32, -215, -20), "outR": (620, 32, 215, -20),
}
order = ["hero", "inL", "inR", "outL", "outR"][:n]
assign = dict(zip(order, ids))
draw = [s for s in ["outL", "outR", "inL", "inR", "hero"] if s in assign]  # back -> front
C = 2200; canvas = Image.new("RGBA", (C, C), (0, 0, 0, 0)); pivot = (1100, 1600)
for s in draw:
    h, ang, dx, dy = slots[s]
    im = fit(cutout(assign[s]), h)
    pad = Image.new("RGBA", (im.width * 3, im.height * 2), (0, 0, 0, 0)); bx, by = pad.width // 2, pad.height // 2
    pad.alpha_composite(im, (bx - im.width // 2, by - im.height))
    rot = pad.rotate(-ang, resample=Image.BICUBIC, center=(bx, by))
    x, y = pivot[0] + dx - bx, pivot[1] + dy - by
    sh = Image.new("RGBA", rot.size, (0, 0, 0, 0)); sh.putalpha(rot.getchannel("A").point(lambda v: int(v * 0.22)))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)), (x + 10, y + 14)); canvas.alpha_composite(rot, (x, y))
canvas = canvas.crop(canvas.getbbox())
side = max(canvas.size) + 8
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0)); sq.alpha_composite(canvas, ((side - canvas.width) // 2, (side - canvas.height) // 2))
sq = sq.resize((800, 800), Image.LANCZOS)
os.makedirs("reports/danh-muc", exist_ok=True)
sq.save(f"reports/danh-muc/{name}.png"); sq.save(f"reports/danh-muc/{name}.webp", lossless=True)
sheet = Image.new("RGB", (800 * 2 + 200, 800), (255, 255, 255))
for i, bg in enumerate([(40, 40, 40), (252, 232, 230)]):
    b = Image.new("RGBA", (800, 800), bg + (255,)); b.alpha_composite(sq); sheet.paste(b.convert("RGB"), (i * 800, 0))
for j, px in enumerate([112, 56]):  # 2x of 56px tile and 28px menu icon
    b = Image.new("RGBA", (px, px), (252, 232, 230, 255)); b.alpha_composite(sq.resize((px, px), Image.LANCZOS)); sheet.paste(b.convert("RGB"), (1640, 40 + j * 160))
sheet.save(os.path.join("work", f"{name}-check.jpg"), quality=88)
print("ok", name, assign)
