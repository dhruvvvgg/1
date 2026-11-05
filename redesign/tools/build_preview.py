"""Build the competition preview of the homepage.

The preview is the same page with three differences:
  1. A permanent banner says it is a concept entry, not the official website.
  2. CSS and JS are inlined, and photos come from local files in assets/img/
     (the preview host blocks images from other websites).
  3. Forms hand off to srmist.edu.in as links instead of submitting.

Usage: python3 tools/build_preview.py   (run from the redesign/ folder)
Output: preview/index.html plus preview/img/ (only the photos that exist locally)
"""
import os
import re
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "preview")
IMG_SRC = os.path.join(ROOT, "assets", "img")
IMG_OUT = os.path.join(OUT, "img")

html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
css = open(os.path.join(ROOT, "assets", "css", "main.css"), encoding="utf-8").read()
js = open(os.path.join(ROOT, "assets", "js", "main.js"), encoding="utf-8").read()

# Butler can't be served to the preview host; Bodoni Moda (already in the font stack) takes over.
css = re.sub(r'@font-face \{ font-family: "Butler";[^}]*\}\n?', "", css)
css += """
/* Preview host: paint the phone's top safe area in the header colour */
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 90; background: #e4b316; }
"""

body = html[html.index("<body>") + len("<body>"): html.index("</body>")]

# Photos: use a local copy when one exists, otherwise leave the remote URL (shows the brand-blue frame).
os.makedirs(IMG_OUT, exist_ok=True)
available = set(os.listdir(IMG_SRC)) if os.path.isdir(IMG_SRC) else set()
# assets/img/map.json maps a srmist.edu.in filename to a local file with a different name
# (for example an openly licensed Wikimedia Commons photo standing in for it).
import json
mapping = {}
if "map.json" in available:
    mapping = {k: v for k, v in json.load(open(os.path.join(IMG_SRC, "map.json"))).items() if not k.startswith("_")}
used = set()
def swap(m):
    url = m.group(0)
    name = url.rsplit("/", 1)[-1]
    name = mapping.get(name, name)
    if name in available:
        used.add(name)
        return "img/" + name
    return url
body = re.sub(r"https://www\.srmist\.edu\.in/wp-content/uploads/[^\"' )]+\.(?:jpg|jpeg|png|svg|webp)", swap, body)
for name in used:
    shutil.copy2(os.path.join(IMG_SRC, name), os.path.join(IMG_OUT, name))

# Forms: no cross-site submission on the preview host.
body = re.sub(r'(<form[^>]*?) action="([^"]+)"', r'\1 data-action="\2"', body)
body = body.replace('data-finder>', 'data-finder data-preview>')

banner = """<div class="concept-bar" role="note">
    <div class="container">
      <span><b>Concept redesign</b> entered in the SRM Website Design Challenge 2026. This is not the official SRMIST website.</span>
      <a href="https://www.srmist.edu.in/">Go to the official site, srmist.edu.in</a>
    </div>
  </div>"""
body = body.replace('<header class="site-header" data-header>', '<header class="site-header" data-header>\n  ' + banner, 1)

head = """<title>SRMIST Homepage Concept</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Concept redesign of the SRMIST homepage for the SRM Website Design Challenge 2026.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,600;6..96,800;6..96,900&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap">
<script>document.documentElement.dataset.env = "preview"; document.documentElement.lang = "en-IN";</script>
<style>
""" + css + "\n</style>\n"

page = head + body.replace('<script src="assets/js/main.js" defer></script>', "<script>\n" + js + "\n</script>")
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page)
missing = sorted({u.rsplit("/", 1)[-1] for u in re.findall(r"https://www\.srmist\.edu\.in/wp-content/uploads/[^\"' )]+\.(?:jpg|jpeg|png|svg|webp)", page)})
print(f"preview/index.html written, {len(used)} local photos used, {len(missing)} still remote")
for m in missing:
    print("  needs:", m)
