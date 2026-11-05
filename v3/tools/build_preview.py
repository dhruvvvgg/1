"""Bundle v3 for the competition link: CSS and JS inlined, images published as files.
Usage (from v3/): python3 tools/build_preview.py  ->  preview/index.html, preview/page.html
"""
import os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "preview")
css = open(os.path.join(ROOT, "assets/css/site.css"), encoding="utf-8").read()
js = open(os.path.join(ROOT, "assets/js/site.js"), encoding="utf-8").read()
os.makedirs(os.path.join(OUT, "assets/img"), exist_ok=True)
shutil.copytree(os.path.join(ROOT, "assets/img"), os.path.join(OUT, "assets/img"), dirs_exist_ok=True)

def bundle(name, as_main):
    s = open(os.path.join(ROOT, name), encoding="utf-8").read()
    s = s.replace('<link rel="stylesheet" href="assets/css/site.css">', "<style>\n" + css + "\n</style>")
    s = s.replace('<script src="assets/js/site.js" defer></script>', "<script>\n" + js + "\n</script>")
    if as_main:  # the artifact host supplies doctype/html/head/body for the main page
        head = s[s.index("<head>") + 6: s.index("</head>")]
        head = re.sub(r'<meta (charset|name="viewport")[^>]*>\n?', "", head)
        body = s[s.index("<body>") + 6: s.index("</body>")]
        s = '<meta charset="utf-8">\n' + head.strip() + "\n" + body
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(s)

for _n in ("academics.html", "admissions.html", "research.html", "placements.html", "campus-life.html"):
    bundle(_n, False)
bundle("index.html", True)
bundle("page.html", False)
print("built", len(os.listdir(os.path.join(OUT, "assets/img"))), "entries")
