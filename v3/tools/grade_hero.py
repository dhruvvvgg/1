"""Builds the hero wordmark photos and the Lead backdrop with one shared grade, so the letters read as one family.
Each source is cropped to the wordmark's own proportions around a chosen focus, then:
  slight desaturation, a gentle S-curve, navy in the shadows, warmth in the highlights, and the mean luminance pulled to ~0.52.
No gradients, no glow. Usage (from v3/): python tools/grade_hero.py
"""
import os
import numpy as np
from PIL import Image, ImageEnhance
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
OUT = os.path.join(IMG, "hero"); os.makedirs(OUT, exist_ok=True)
NAVY = np.array([10, 19, 37], np.float32) / 255; WARM = np.array([255, 238, 205], np.float32) / 255
# (source, output, focus x, focus y, aspect w/h)  focus = where the crop is centred, as a share of the source
SETS = [
    ("commons-bihu-team.webp", "h1.webp", 0.50, 0.58, 4.4),
    ("bg/off-agriculture.webp", "h2.webp", 0.50, 0.72, 4.4),
    ("srmist-aerial-official.webp", "h3.webp", 0.50, 0.50, 4.4),
    ("bg/off-architecture.webp", "h4.webp", 0.50, 0.60, 4.4),
    ("bg/off-admissions.webp", "h5.webp", 0.50, 0.48, 4.4),
    ("commons-bihu-team.webp", "h1m.webp", 0.50, 0.50, 1.25),      # phone crops: two stacked lines need a squarer picture
    ("bg/off-agriculture.webp", "h2m.webp", 0.50, 0.74, 1.25),
    ("srmist-aerial-official.webp", "h3m.webp", 0.52, 0.52, 1.25),
    ("bg/off-architecture.webp", "h4m.webp", 0.50, 0.55, 1.25),
    ("bg/off-admissions.webp", "h5m.webp", 0.40, 0.52, 1.25),
    ("bg/off-convocation.webp", "lead.webp", 0.50, 0.50, None, 0.36, 0.80),   # chapter backdrops keep their own proportions and sit a little darker
    ("commons-0j9a0195.webp", "learn.webp", 0.50, 0.50, None, 0.40, 0.80),
    ("srmist-sports-official.webp", "story-sports.webp", 0.50, 0.50, None, 0.52, 0.97),   # the original carries a heavy blue-grey cast
]
ZOOM = {"h2m.webp": 0.55, "h5m.webp": 0.62, "h5.webp": 0.78, "h4m.webp": 0.8}   # tighter crops where the full frame has pale, empty areas
def grade(a, target=0.52, ceiling=1.0):
    sat = ImageEnhance.Color(Image.fromarray((a * 255).astype(np.uint8))).enhance(0.88)
    a = np.asarray(sat, np.float32) / 255
    a = a + 0.25 * (a - 0.5) * (1 - np.abs(2 * a - 1)) * 2            # gentle S-curve
    Y = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    a = a * (1 - 0.12 * (1 - Y)) + NAVY * 0.12 * (1 - Y)              # navy in the shadows
    a = a * (1 - 0.08 * Y) + WARM * 0.08 * Y                          # warmth in the highlights
    a = np.clip(a, 0, 1)
    m = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]).mean()
    g = np.log(target) / np.log(max(m, 0.02))                          # gamma that lands the mean on target
    return np.clip(a ** g, 0, ceiling)                                  # a ceiling keeps white text legible on the stage overlay
for row in SETS:
    src, dst, fx, fy, asp = row[:5]; tgt = row[5] if len(row) > 5 else (0.48 if asp else 0.52); ceil = row[6] if len(row) > 6 else (0.92 if asp else 1.0)
    im = Image.open(os.path.join(IMG, src)).convert("RGB"); w, h = im.size
    if asp:
        z = ZOOM.get(dst, 1.0); cw = round(w * z); ch = round(cw / asp)
        if ch > h: ch = h; cw = round(h * asp)
        x0 = int(min(max(fx * w - cw / 2, 0), w - cw)); y0 = int(min(max(fy * h - ch / 2, 0), h - ch))
        im = im.crop((x0, y0, x0 + cw, y0 + ch)); tw = 1760 if asp > 2 else 1000
        im = im.resize((tw, round(tw / asp)), Image.LANCZOS)
    a = grade(np.asarray(im, np.float32) / 255, tgt, ceil)
    out = Image.fromarray((a * 255).astype(np.uint8)); out.save(os.path.join(OUT, dst), "WEBP", quality=82)
    Y = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])
    print(f"{dst:10} {out.size}  mean {Y.mean():.2f}  near-black {(Y < 0.12).mean()*100:4.1f}%")
# (The Tech Park copies were cropped once, by hand, to remove the photographer's watermark along the bottom edge.)
