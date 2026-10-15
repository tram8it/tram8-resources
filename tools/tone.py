#!/usr/bin/env python3
"""Even out brightness and white balance of finished product images.

    python3 tools/tone.py <image.webp> <out.webp>      # adjust one image
    python3 tools/tone.py --check <image.webp>          # measure only
    python3 tools/tone.py --scan [categories/<dir>]     # list underexposed finished images
    python3 tools/tone.py --vivid <image.webp> <out.webp>  # tone, then brand-like colour (RUBRIC v10)

Works on finished images (white background, product centred, from
make_image.py / cutout.py). Only the product pixels (non-white) are measured.
Two global corrections, nothing local (RUBRIC v7):

1. White balance: if the product has enough near-neutral bright pixels (white
   or grey print, a white lid), scale R, G, B so their average is neutral.
   Each channel moves at most ±8%, so a pack that is meant to be warm stays warm.
2. Levels on luminance only: stretch so the product's bright end (99th
   percentile) reaches ~245, and lift mid-tones only when the photo is
   underexposed (dull highlights), never because the pack itself is dark.
   Hue and saturation are kept; the gain is capped so black packs stay black.

The background stays pure white. Open the output and compare: a pack whose
real colour is dark (a black bottle) must still look dark, just not muddy.
"""
import json
import sys
from pathlib import Path

from PIL import Image

WHITE = 245            # background threshold, as make_image.py
TARGET_HIGH = 245      # product highlights end here
TARGET_MEDIAN = 120    # lift the median toward this when darker
MAX_GAIN = 1.45        # at most +45% on the bright end
MAX_GAMMA_LIFT = 0.80  # gamma floor for the mid-tone lift (1.0 = none)
WB_LIMIT = 0.08        # ±8% per channel
EXPOSED_P99 = 228      # highlights at or above this = exposed correctly: a dark median is the pack's colour


def _luma(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def _product_pixels(img: Image.Image):
    px = list(img.get_flattened_data() if hasattr(img, "get_flattened_data") else img.getdata())
    return [p for p in px if min(p) < WHITE]


def measure(path: str) -> dict:
    img = Image.open(path).convert("RGB")
    prod = _product_pixels(img)
    if not prod:
        return {"input": path, "productPixels": 0}
    lum = sorted(_luma(*p) for p in prod)
    n = len(lum)
    neutral = [p for p in prod if max(p) - min(p) < 18 and _luma(*p) > 150]
    cast = None
    if len(neutral) > n * 0.01:
        avg = [sum(p[i] for p in neutral) / len(neutral) for i in range(3)]
        cast = [round(a / (sum(avg) / 3), 3) for a in avg]
    return {
        "input": path,
        "productPixels": n,
        "median": round(lum[n // 2], 1),
        "p99": round(lum[min(n - 1, int(n * 0.99))], 1),
        "neutralCast": cast,  # [R, G, B] relative to grey; None = not enough neutral pixels
    }


def adjust(path: str, out: str) -> dict:
    info = measure(path)
    img = Image.open(path).convert("RGB")
    if not info.get("productPixels"):
        img.save(out, "WEBP", quality=86, method=6)
        return {**info, "output": out, "changed": False}
    # 1. White balance from neutral pixels, capped.
    wb = [1.0, 1.0, 1.0]
    if info["neutralCast"]:
        wb = [min(1 + WB_LIMIT, max(1 - WB_LIMIT, 1 / c)) for c in info["neutralCast"]]
    # 2. Levels on luminance: gain to bring p99 to TARGET_HIGH, then a gamma lift for a dark median.
    gain = min(MAX_GAIN, max(1.0, TARGET_HIGH / max(info["p99"], 1)))
    med = min(255.0, info["median"] * gain)
    gamma = 1.0
    # Lift mid-tones only for an underexposed photo (dull highlights). A brand render whose
    # highlights are bright is exposed right; a dark median there is a dark pack (maroon, black).
    if med < TARGET_MEDIAN and info["p99"] < EXPOSED_P99:
        # solve (med/255)^gamma = TARGET_MEDIAN/255, keep it gentle
        import math
        gamma = max(MAX_GAMMA_LIFT, math.log(TARGET_MEDIAN / 255) / math.log(max(med, 1) / 255))
    src = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            if min(r, g, b) >= WHITE:
                continue  # background stays white
            r, g, b = r * wb[0], g * wb[1], b * wb[2]
            l0 = max(_luma(r, g, b), 1e-3)
            l1 = 255 * (min(255.0, l0 * gain) / 255) ** gamma
            k = l1 / l0  # scale all channels together: hue and saturation kept
            src[x, y] = tuple(max(0, min(255, round(c * k))) for c in (r, g, b))
    img.save(out, "WEBP", quality=86, method=6)
    after = measure(out)
    return {
        **info,
        "output": out,
        "whiteBalance": [round(v, 3) for v in wb],
        "gain": round(gain, 3),
        "gamma": round(gamma, 3),
        "after": {"median": after.get("median"), "p99": after.get("p99")},
        "changed": gain > 1.001 or gamma < 0.999 or wb != [1.0, 1.0, 1.0],
    }


VIVID_SAT = 1.25       # saturation boost for a dull photo (RUBRIC v10)
VIVID_CONTRAST = 1.08  # contrast boost around the product's mean luminance
VIVID_FULL_BELOW = 0.40  # product mean saturation at or below this gets the full boost
VIVID_NONE_ABOVE = 0.75  # at or above this it is already as vivid as a brand render: no boost


def vivid(path: str, out: str) -> dict:
    """tone.py first, then saturation/contrast on product pixels only, scaled down for
    images that are already vivid so a brand render is not pushed into clipping."""
    import numpy as np

    info = adjust(path, out)
    img = Image.open(out).convert("RGB")
    rgb = np.asarray(img).astype(np.float32)
    mask = rgb.min(axis=2) < WHITE
    if not mask.any():
        return {**info, "vivid": 0.0}
    hsv = np.asarray(img.convert("HSV")).astype(np.float32)
    sat = float(hsv[..., 1][mask].mean() / 255)
    t = min(1.0, max(0.0, (VIVID_NONE_ABOVE - sat) / (VIVID_NONE_ABOVE - VIVID_FULL_BELOW)))
    s_gain = 1 + (VIVID_SAT - 1) * t
    c_gain = 1 + (VIVID_CONTRAST - 1) * t
    if t > 0:
        lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
        mean_l = float(lum[mask].mean())
        boosted = lum[..., None] + (rgb - lum[..., None]) * s_gain  # saturation around own grey
        boosted = mean_l + (boosted - mean_l) * c_gain  # contrast around product mean
        rgb = np.where(mask[..., None], np.clip(boosted, 0, 255), rgb)
        Image.fromarray(rgb.round().astype(np.uint8)).save(out, "WEBP", quality=86, method=6)
    return {**info, "saturationBefore": round(sat, 3), "saturationGain": round(s_gain, 3),
            "contrastGain": round(c_gain, 3), "changed": info["changed"] or t > 0}


def scan(root: str):
    rows = []
    for f in sorted(Path(root).glob("**/image.webp")):
        m = measure(str(f))
        # Underexposed: dull highlights. A dark median alone is just a dark pack.
        if m.get("productPixels") and m["p99"] < EXPOSED_P99:
            rows.append((m["median"], m["p99"], str(f.parent)))
    for med, p99, d in sorted(rows):
        print(f"{med:6.1f} {p99:6.1f}  {d}")
    print(f"{len(rows)} underexposed images (product highlights p99 < {EXPOSED_P99})")


def main(argv):
    if len(argv) == 3 and argv[1] == "--check":
        print(json.dumps(measure(argv[2]), ensure_ascii=False))
    elif len(argv) == 4 and argv[1] == "--vivid":
        print(json.dumps(vivid(argv[2], argv[3]), ensure_ascii=False))
    elif len(argv) in (2, 3) and argv[1] == "--scan":
        scan(argv[2] if len(argv) == 3 else "categories")
    elif len(argv) == 3:
        print(json.dumps(adjust(argv[1], argv[2]), ensure_ascii=False))
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main(sys.argv)
