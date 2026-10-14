#!/usr/bin/env python3
"""Cut a product out of a coloured or busy background, then normalise it.

    python3 tools/cutout.py <input> <output.webp> [--box X0,Y0,X1,Y1] [--erode N]

For photos that fail RUBRIC I4 only because of the background: a staff photo
on a table, or a brand banner with a backdrop, a glow, badges or promo text.
--box first crops to the product so badges and text outside it are dropped.
The background is removed with rembg (u2net); the mask is then hardened and
eroded by N px (default 9) to drop glow/halo fringes, and the result goes
through make_image.py (1000x1000 WebP, white, centred at 84%).

It only cuts: never paint, redraw or retouch the product (RUBRIC v5). Open the
output and look at the edges, the lid/rim and any white parts of the pack; a
white lid on a light backdrop is where the mask most often fails.

Setup (once per machine): pip install "rembg[cpu]". The first run downloads
the u2net model (~176 MB) to ~/.u2net.
"""
import argparse
import json
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
import make_image  # noqa: E402

ALPHA_KEEP = 200  # mask values above this are product; softer edges are mostly backdrop glow


def cut(path: str, box, erode: int) -> Image.Image:
    from rembg import new_session, remove

    rgb = Image.open(path).convert("RGB")
    if box:
        rgb = rgb.crop(box)
    alpha = remove(rgb, session=new_session("u2net")).split()[3]
    mask = alpha.point(lambda v: 255 if v > ALPHA_KEEP else 0)
    if erode > 1:
        mask = mask.filter(ImageFilter.MinFilter(erode | 1))  # MinFilter needs an odd size
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new("RGBA", rgb.size, (255, 255, 255, 0))
    out.paste(rgb, (0, 0), mask)
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--box", help="crop to X0,Y0,X1,Y1 (pixels) before cutting")
    parser.add_argument("--erode", type=int, default=9, help="px trimmed off the mask edge")
    args = parser.parse_args()
    box = tuple(int(v) for v in args.box.split(",")) if args.box else None
    if box and len(box) != 4:
        raise SystemExit("--box needs X0,Y0,X1,Y1")
    # The intermediate stays out of the product folder, which only holds finished files.
    with tempfile.TemporaryDirectory() as tmp:
        cutout = Path(tmp) / "cutout.png"
        cut(args.input, box, args.erode).save(cutout)
        info = make_image.make(str(cutout), args.output)
    info.update({"input": args.input, "box": box, "erode": args.erode})
    print(json.dumps(info, ensure_ascii=False))


if __name__ == "__main__":
    main()
