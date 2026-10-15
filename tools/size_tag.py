#!/usr/bin/env python3
"""Add a net-weight tag (e.g. "53g") to a finished product image (RUBRIC v16).

    python3 tools/size_tag.py <image.webp> <out.webp> <text>

Used when two sizes of one product share the same front-of-pack picture: the
tag is the only thing that tells them apart. The product is re-fitted to fill
80% (instead of 84%) so the tag sits in the free bottom band and never covers
the pack. Run it on the untagged image (keep it, e.g. under work/), not on an
already tagged one. Open the result and look at it.
"""
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, __import__("os").path.dirname(__file__))
from make_image import SIDE, content_box, flatten  # noqa: E402

FILL = 0.80
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
TAG_H = 64
MARGIN = 24
BG = (31, 41, 55)       # dark slate, readable on white, neutral to any brand
FG = (255, 255, 255)


def tag(path: str, out: str, text: str) -> None:
    rgb = flatten(Image.open(path))
    box = content_box(rgb)
    if box is None:
        raise SystemExit("blank image")
    product = rgb.crop(box)
    pw, ph = product.size
    scale = (SIDE * FILL) / max(pw, ph)
    size = (round(pw * scale), round(ph * scale))
    product = product.resize(size, Image.LANCZOS)
    canvas = Image.new("RGB", (SIDE, SIDE), (255, 255, 255))
    canvas.paste(product, ((SIDE - size[0]) // 2, (SIDE - size[1]) // 2))

    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(FONT, 40)
    l, t, r, b = draw.textbbox((0, 0), text, font=font)
    tw, th = r - l, b - t
    w = tw + 2 * 28
    x1, y1 = SIDE - MARGIN, SIDE - MARGIN
    x0, y0 = x1 - w, y1 - TAG_H
    draw.rounded_rectangle((x0, y0, x1, y1), radius=TAG_H // 2, fill=BG)
    draw.text((x0 + (w - tw) / 2 - l, y0 + (TAG_H - th) / 2 - t), text, font=font, fill=FG)
    canvas.save(out, "WEBP", quality=86, method=6)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    tag(*sys.argv[1:])
