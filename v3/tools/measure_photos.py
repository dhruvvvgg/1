"""Measures how well each photo works inside the hero wordmark letters (background-clip: text).
For the central 60% of each image: mean luminance (0-1), contrast (std of luminance), share of near-black pixels,
and share of "flat" area (little local detail). Good candidates: mean 0.35-0.75, low near-black share, low flat share.
Usage (from v3/): python tools/measure_photos.py
"""
import glob, os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = sorted(glob.glob(ROOT + r"\assets\img\*.webp") + glob.glob(ROOT + r"\assets\img\bg\*.webp"))
skip = ("ub-lakeside", "story-apple")
rows = []
for f in files:
    n = os.path.relpath(f, ROOT + r"\assets\img")
    if any(k in n for k in skip): continue
    im = Image.open(f).convert("RGB"); w, h = im.size
    im = im.crop((int(w * .2), int(h * .2), int(w * .8), int(h * .8))); im.thumbnail((400, 400))
    a = np.asarray(im, dtype=np.float32) / 255
    lin = np.where(a <= 0.03928, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    L = 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]
    Y = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]      # perceptual-ish (gamma) luma, what the eye reads
    gy, gx = np.gradient(Y); detail = np.hypot(gx, gy)
    rows.append((n, Y.mean(), Y.std(), (Y < 0.12).mean(), (detail < 0.01).mean()))
print(f"{'image':58} {'mean':>5} {'std':>5} {'black%':>7} {'flat%':>6}  verdict")
for n, m, s, bl, fl in sorted(rows, key=lambda r: r[0]):
    ok = 0.35 <= m <= 0.75 and bl < 0.12 and fl < 0.45
    print(f"{n:58} {m:5.2f} {s:5.2f} {bl*100:6.1f}% {fl*100:5.1f}%  {'PASS' if ok else '-'}")
