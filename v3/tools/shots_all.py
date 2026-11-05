"""Full-page 1440px screenshots of the home page and the five inner pages.
Home: the pinned chapters are captured as live frames and stitched in. Serve v3/ first:  python -m http.server 8123
Usage: python tools/shots_all.py OUTDIR
"""
import os, sys, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image

BASE = "http://localhost:8123/"; out = sys.argv[1]; os.makedirs(out, exist_ok=True)
W, H = 1440, 900; tmp = tempfile.mkdtemp()
pages = [("index", "home"), ("academics", "academics"), ("admissions", "admissions"), ("research", "research"), ("placements", "placements"), ("campus-life", "campus-life")]

def warm(pg):
    pg.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
    total = pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0, total, 500):
        pg.evaluate(f"scrollTo(0,{y})"); pg.wait_for_timeout(110)
    pg.evaluate("scrollTo(0,0)"); pg.wait_for_timeout(1400)

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    for slug, name in pages:
        pg = b.new_page(viewport={"width": W, "height": H}, reduced_motion="reduce")
        pg.goto(f"{BASE}{slug}.html", wait_until="networkidle"); warm(pg)
        if slug == "index":
            top, bot = pg.evaluate("(()=>{const r=document.querySelector('.chapters').getBoundingClientRect();return [Math.round(r.top+scrollY),Math.round(r.bottom+scrollY)]})()")
        pg.screenshot(path=f"{tmp}/{name}.png", full_page=True); pg.close()
        if slug == "index":
            pg = b.new_page(viewport={"width": W, "height": H}); pg.goto(f"{BASE}index.html", wait_until="networkidle")
            pg.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')"); pg.add_style_tag(content=".header{visibility:hidden}"); pg.wait_for_timeout(1500)
            for i in range(4):
                pg.evaluate(f"(()=>{{const c=document.querySelectorAll('[data-chapter]')[{i}].getBoundingClientRect();scrollTo(0,scrollY+c.top+c.height/2-{H//2}+{H//8})}})()")
                pg.wait_for_timeout(2200); pg.screenshot(path=f"{tmp}/ch{i}.png")
            pg.close()
            full = Image.open(f"{tmp}/home.png").convert("RGB"); shots = [Image.open(f"{tmp}/ch{i}.png").convert("RGB") for i in range(4)]
            res = Image.new("RGB", (W, top + sum(s.height for s in shots) + 24 * 3 + full.height - bot), (247, 246, 242))
            res.paste(full.crop((0, 0, W, top)), (0, 0)); y = top
            for k, s_ in enumerate(shots):
                res.paste(s_, (0, y)); y += s_.height + (24 if k < 3 else 0)
            res.paste(full.crop((0, bot, W, full.height)), (0, y)); res.save(f"{out}/{name}.png")
        else:
            Image.open(f"{tmp}/{name}.png").convert("RGB").save(f"{out}/{name}.png")
        print(name, Image.open(f"{out}/{name}.png").size)
    b.close()
