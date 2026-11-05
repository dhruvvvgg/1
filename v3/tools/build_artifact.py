"""Copy the built site into artifact/ for the claude.ai preview link.
Adds a permanent concept banner to every page and rewrites root paths to relative ones.
Usage (from v3/, after node scripts/build.js): python3 tools/build_artifact.py"""
import os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "artifact")
shutil.rmtree(OUT, ignore_errors=True)
shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(OUT, "assets"))

BANNER = ('<div class="concept-bar" role="note" style="background:#121418;color:#f4f3ee;font:600 14px/1.4 Manrope,system-ui,sans-serif;'
          'padding:8px 16px;display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:space-between">'
          '<span>Concept redesign entered in the SRM Website Design Challenge 2026. This is not the official SRMIST website.</span>'
          '<a href="https://www.srmist.edu.in/" target="_blank" rel="noopener noreferrer" style="color:#e4b316">Go to the official site, srmist.edu.in</a></div>')

pages = [os.path.relpath(os.path.join(d, f), ROOT) for d, _, fs in os.walk(ROOT) for f in fs
         if f == "index.html" and not any(x in d for x in ("artifact", "node_modules", "preview"))]
for rel in pages:
    depth = rel.count(os.sep)
    up = "../" * depth
    def fix(path):
        path, sep, rest = re.match(r"([^?#]*)([?#]?)(.*)", path).groups()
        if path.endswith("/"): path += "index.html"
        return up + path.lstrip("/") + sep + rest
    s = open(os.path.join(ROOT, rel), encoding="utf-8").read()
    s = re.sub(r'((?:href|src)=")(/[^/"][^"]*|/)(")', lambda m: m.group(1) + fix(m.group(2)) + m.group(3), s)
    s = s.replace('"/programs/btech-cse/"', '"' + up + 'programs/btech-cse/index.html"')
    s = s.replace("<body>", "<body>\n" + BANNER, 1) if "<body>" in s else re.sub(r"(<body[^>]*>)", r"\1\n" + BANNER, s, count=1)
    if depth == 0:  # the host wraps the main page in its own skeleton
        head = s[s.index("<head>") + 6: s.index("</head>")]
        head = re.sub(r'<meta (charset|name="viewport")[^>]*>\n?', "", head)
        body = s[s.index(">", s.index("<body")) + 1: s.index("</body>")]
        s = '<meta charset="utf-8">\n' + head.strip() + "\n" + body
    dest = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, "w", encoding="utf-8").write(s)

for js in ("site.js", "inner.js"):
    p = os.path.join(OUT, "assets/js", js)
    t = open(p, encoding="utf-8").read()
    t = t.replace('fetch("/assets/data/ask-index.json")', 'fetch("assets/data/ask-index.json")')
    t = t.replace('anchor("/contact/"', 'anchor("contact/index.html"').replace('"/programs/?q="', '"programs/index.html?q="')
    t = t.replace('p.href.startsWith("/")', '!/^https?:/.test(p.href)')
    open(p, "w", encoding="utf-8").write(t)
print(len(pages), "pages")
