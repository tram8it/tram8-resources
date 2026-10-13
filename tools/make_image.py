#!/usr/bin/env python3
"""Normalise a product photo to the RUBRIC finished-image standard.

    python3 tools/make_image.py <input> <output.webp>     # make image.webp
    python3 tools/make_image.py --check <input>           # measure only, write nothing

Standard (RUBRIC "Chuẩn thành phẩm"): 1000x1000 WebP q86, white #FFFFFF
background, product centred and filling ~84% of the long side.

The script only measures and resizes. It never decides KEEP/CROP/REPLACE:
open the input and the output and look at them (CLAUDE.md, hard rule 1).
Warnings it prints are hints for that look, e.g. a product touching the frame
edge (RUBRIC I5) or a non-white border (I4).
"""
import json
import sys

from PIL import Image, ImageChops

SIDE = 1000
FILL = 0.84
WHITE_THRESHOLD = 245  # a pixel is "background" when every channel is above this
MAX_UPSCALE = 3.0      # RUBRIC v3: small brand images may be enlarged up to ~3x


def flatten(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    base = Image.new("RGBA", img.size, (255, 255, 255, 255))
    base.alpha_composite(img)
    return base.convert("RGB")


def content_box(rgb: Image.Image):
    """Bounding box of the non-white content, or None for a blank image."""
    gray = rgb.convert("L")
    mask = gray.point(lambda v: 255 if v < WHITE_THRESHOLD else 0)
    # Also catch pale-but-coloured pixels a grey threshold would miss.
    diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, (255, 255, 255)))
    colour = diff.convert("L").point(lambda v: 255 if v > 255 - WHITE_THRESHOLD else 0)
    return ImageChops.lighter(mask, colour).getbbox()


def border_white_ratio(rgb: Image.Image) -> float:
    """Share of the 1px outer frame that is white: low means a coloured/photo background."""
    w, h = rgb.size
    px = rgb.load()
    points = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
    points += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    white = sum(1 for p in points if min(px[p]) >= WHITE_THRESHOLD)
    return white / len(points)


def measure(path: str) -> dict:
    src = Image.open(path)
    rgb = flatten(src)
    w, h = rgb.size
    box = content_box(rgb)
    info = {
        "input": path,
        "size": [w, h],
        "square": w == h,
        "borderWhite": round(border_white_ratio(rgb), 3),
        "contentBox": list(box) if box else None,
        "warnings": [],
    }
    if box is None:
        info["warnings"].append("blank image (I1)")
        return info
    left, top, right, bottom = box
    if left <= 1 or top <= 1 or right >= w - 1 or bottom >= h - 1:
        info["warnings"].append("content touches the frame edge: check the product is whole (I5)")
    if info["borderWhite"] < 0.9:
        info["warnings"].append("border is not white: coloured or photo background (I4)")
    if min(w, h) < 300:
        info["warnings"].append("short side under 300px (I6)")
    return info


def make(path: str, out: str) -> dict:
    info = measure(path)
    if info["contentBox"] is None:
        raise SystemExit(json.dumps(info, ensure_ascii=False))
    rgb = flatten(Image.open(path))
    left, top, right, bottom = info["contentBox"]
    product = rgb.crop((left, top, right, bottom))
    pw, ph = product.size
    scale = (SIDE * FILL) / max(pw, ph)
    if scale > MAX_UPSCALE:
        info["warnings"].append(
            f"needs {scale:.1f}x enlargement (> {MAX_UPSCALE}x): likely too blurry (I6), look before using"
        )
    size = (max(1, round(pw * scale)), max(1, round(ph * scale)))
    product = product.resize(size, Image.LANCZOS)
    canvas = Image.new("RGB", (SIDE, SIDE), (255, 255, 255))
    canvas.paste(product, ((SIDE - size[0]) // 2, (SIDE - size[1]) // 2))
    canvas.save(out, "WEBP", quality=86, method=6)
    info.update({"output": out, "scale": round(scale, 2), "productSize": list(size)})
    return info


def main(argv):
    if len(argv) == 3 and argv[1] == "--check":
        print(json.dumps(measure(argv[2]), ensure_ascii=False))
    elif len(argv) == 3:
        print(json.dumps(make(argv[1], argv[2]), ensure_ascii=False))
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main(sys.argv)
