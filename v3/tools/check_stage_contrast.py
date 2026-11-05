"""Contrast of the white stage headline over each chapter backdrop, with the 0.52 navy overlay, at 1440x900.
Samples the headline area (left 4-46%, middle 36-64%) and reports contrast of the light text colour against the 95th percentile
and the brightest pixel there. Needs >= 4.5 against the 95th percentile (large text needs 3 at minimum).
Usage (from v3/): python tools/check_stage_contrast.py [more image paths...]
"""
import os, sys
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAVY = np.array([10, 19, 37], np.float32); TEXT = np.array([244, 243, 238], np.float32); OV = 0.52
def lum(rgb):
    c = rgb / 255; c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
def check(path, W=1440, H=900):
    im = Image.open(path).convert("RGB"); w, h = im.size; s = max(W / w, H / h)
    im = im.resize((max(W, round(w * s)), max(H, round(h * s)))); l = (im.width - W) // 2; t = (im.height - H) // 2
    a = np.asarray(im.crop((l, t, l + W, t + H)), np.float32) * (1 - OV) + NAVY * OV
    reg = a[int(H * .36):int(H * .64), int(W * .04):int(W * .46)]
    Lb = lum(reg); Lt = lum(TEXT)
    c95 = (Lt + .05) / (np.percentile(Lb, 95) + .05); cmax = (Lt + .05) / (Lb.max() + .05)
    return c95, cmax
if __name__ == "__main__":
    paths = sys.argv[1:] or [os.path.join(ROOT, "assets", "img", p) for p in
        ["commons-0j9a0195.webp", "bg/lab-research.webp", "bg/milan-dance.webp", "hero/lead.webp", "commons-rays-of-hope.webp"]]
    for p in paths:
        c95, cmax = check(p); print(f"{os.path.relpath(p, ROOT + chr(92) + 'assets' + chr(92) + 'img'):34} 95th pct {c95:5.2f}:1   brightest {cmax:5.2f}:1   {'OK' if c95 >= 4.5 else 'LOW'}")
