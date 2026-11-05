"""Bundle v3 for the competition link: CSS and JS inlined, images published as files.
Usage (from v3/): python3 tools/build_preview.py  ->  all seven pages in preview/
"""
import os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "preview")
os.makedirs(os.path.join(OUT, "assets/img"), exist_ok=True)
shutil.copytree(os.path.join(ROOT, "assets/img"), os.path.join(OUT, "assets/img"), dirs_exist_ok=True)

def bundle(name, as_main):
    s = open(os.path.join(ROOT, name), encoding="utf-8").read()
    s = re.sub(r'<link rel="stylesheet" href="(assets/css/[^"]+)">', lambda m: "<style>\n" + open(os.path.join(ROOT, m[1]), encoding="utf-8").read() + "\n</style>", s)
    s = re.sub(r'<script src="(assets/js/[^"]+)" defer></script>', lambda m: "<script>\n" + open(os.path.join(ROOT, m[1]), encoding="utf-8").read() + "\n</script>", s)
    if as_main:  # the artifact host supplies doctype/html/head/body for the main page
        head = s[s.index("<head>") + 6: s.index("</head>")]
        head = re.sub(r'<meta (charset|name="viewport")[^>]*>\n?', "", head)
        body = s[s.index("<body>") + 6: s.index("</body>")]
        s = '<meta charset="utf-8">\n' + head.strip() + "\n" + body
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(s)

bundle("index.html", True)
bundle("page.html", False)
for name in ["admissions", "academics", "placements", "research", "campus-life"]:
    bundle(name + ".html", False)
print("built", len(os.listdir(os.path.join(OUT, "assets/img"))), "entries")
