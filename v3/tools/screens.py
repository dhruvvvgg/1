"""Full-page screenshots with the pinned chapters shown as they look while scrolling.
Needs: playwright (python) and Chrome. Serve v3/ first:  python -m http.server 8123
Usage: python tools/screens.py OUTDIR  [widths...]   e.g. python tools/screens.py ../docs/screens 1440 1920 768 390
"""
import os, sys, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image

URL = "http://localhost:8123/index.html"
out = sys.argv[1]; widths = [int(w) for w in sys.argv[2:]] or [1440, 1920, 768, 390]
os.makedirs(out, exist_ok=True)
tmp = tempfile.mkdtemp()

def eager(pg):
    pg.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    for W in widths:
        H = 900 if W >= 768 else 844
        pg = b.new_page(viewport={"width": W, "height": H}, reduced_motion="reduce")
        pg.goto(URL, wait_until="networkidle"); eager(pg)
        total = pg.evaluate("document.documentElement.scrollHeight")
        for y in range(0, total, 600):
            pg.evaluate(f"scrollTo(0,{y})"); pg.wait_for_timeout(100)
        pg.evaluate("scrollTo(0,0)"); pg.wait_for_timeout(1200)
        top, bot = pg.evaluate("(()=>{const r=document.querySelector('.chapters').getBoundingClientRect();return [Math.round(r.top+scrollY),Math.round(r.bottom+scrollY)]})()")
        pg.screenshot(path=f"{tmp}/static{W}.png", full_page=True); pg.close()
        pg = b.new_page(viewport={"width": W, "height": H})
        pg.goto(URL, wait_until="networkidle"); eager(pg)
        pg.add_style_tag(content=".header{visibility:hidden}"); pg.wait_for_timeout(1200)
        for i in range(4):
            pg.evaluate(f"(()=>{{const c=document.querySelectorAll('[data-chapter]')[{i}].getBoundingClientRect();scrollTo(0,scrollY+c.top+c.height/2-{H//2}+{H//8})}})()")
            pg.wait_for_timeout(2200); pg.screenshot(path=f"{tmp}/ch{W}_{i}.png")
        pg.close()
        full = Image.open(f"{tmp}/static{W}.png").convert("RGB")
        shots = [Image.open(f"{tmp}/ch{W}_{i}.png").convert("RGB") for i in range(4)]
        gap = 24
        res = Image.new("RGB", (W, top + sum(s.height for s in shots) + gap * 3 + full.height - bot), (247, 246, 242))
        res.paste(full.crop((0, 0, W, top)), (0, 0)); y = top
        for k, s_ in enumerate(shots):
            res.paste(s_, (0, y)); y += s_.height + (gap if k < 3 else 0)
        res.paste(full.crop((0, bot, W, full.height)), (0, y))
        res.save(f"{out}/home-{W}.png"); print(W, res.size)
    b.close()
