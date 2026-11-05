"""Home page checks: console errors, overflow, link status, alt text, text contrast, focus ring, reduced motion, and the inner pages.
Serve v3/ first (python -m http.server 8123). Usage (from v3/): python tools/check_home.py
"""
import re, urllib.request, urllib.error
from playwright.sync_api import sync_playwright
BASE = "http://localhost:8123/"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
PAGES = ["index", "academics", "admissions", "research", "placements", "campus-life"]

CONTRAST_JS = """(()=>{
 const parse=c=>{const m=c.match(/rgba?\\(([^)]+)\\)/); if(!m) return null; const p=m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)};
 const bgOf=e=>{ let el=e, stack=[]; while(el){ const cs=getComputedStyle(el); if(cs.backgroundImage!=='none' || el.matches('.stage,.bgsec,.slide')) return null; const c=parse(cs.backgroundColor); if(c&&c.a>0){ stack.push(c); if(c.a>=1) break; } el=el.parentElement; } let base={r:247,g:246,b:242}; for(let i=stack.length-1;i>=0;i--){const c=stack[i]; base={r:c.r*c.a+base.r*(1-c.a),g:c.g*c.a+base.g*(1-c.a),b:c.b*c.a+base.b*(1-c.a)};} return base; };
 const out=[]; const seen=new Set();
 document.querySelectorAll('body *').forEach(e=>{ if(e.closest('svg,[hidden],.sr-only,.wordmark,.stage')) return; const t=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' '); if(!t) return; const cs=getComputedStyle(e); if(cs.visibility==='hidden'||cs.display==='none'||parseFloat(cs.opacity)===0) return; const r=e.getBoundingClientRect(); if(!r.width||!r.height) return; const bg=bgOf(e); if(!bg) return; let fg=parse(cs.color); if(!fg) return; if(fg.a<1) fg={r:fg.r*fg.a+bg.r*(1-fg.a),g:fg.g*fg.a+bg.g*(1-fg.a),b:fg.b*fg.a+bg.b*(1-fg.a)}; const L1=lum(fg),L2=lum(bg); const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05); const px=parseFloat(cs.fontSize), bold=parseInt(cs.fontWeight)>=700; const large=px>=24||(px>=18.66&&bold); const need=large?3:4.5; if(ratio<need){ const k=(e.className||e.tagName)+'|'+t.slice(0,24); if(!seen.has(k)){seen.add(k); out.push(ratio.toFixed(2)+' (need '+need+') '+k+' '+px+'px');} } });
 return out; })()"""

def status(url):
    for method in ("HEAD", "GET"):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers=UA, method=method), timeout=20); return r.status
        except urllib.error.HTTPError as e:
            if method == "GET" or e.code not in (403, 405, 400): return e.code
        except Exception as e:
            if method == "GET": return type(e).__name__
    return "?"

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    # --- console + overflow on every page at both sizes
    for W, H in ((1440, 900), (390, 844)):
        for n in PAGES:
            pg = b.new_page(viewport={"width": W, "height": H}); errs = []
            pg.on("console", lambda m, errs=errs: errs.append(m.text[:90]) if m.type == "error" else None)
            pg.on("pageerror", lambda e, errs=errs: errs.append(str(e)[:90]))
            pg.goto(BASE + n + ".html", wait_until="load"); pg.wait_for_timeout(700)
            pg.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')"); pg.wait_for_timeout(500)
            o = pg.evaluate("document.documentElement.scrollWidth>innerWidth")
            broken = pg.evaluate("[...document.images].filter(i=>i.complete&&!i.naturalWidth).length")
            print(f"{W:>4} {n:12} errors={errs or 0} overflow={o} brokenImages={broken}"); pg.close()
    # --- home: links, alt, contrast, focus
    pg = b.new_page(viewport={"width": 1440, "height": 900}); pg.goto(BASE + "index.html", wait_until="load"); pg.wait_for_timeout(800)
    hrefs = pg.evaluate("[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href))]")
    ext = [h for h in hrefs if not h.startswith(BASE) and h.startswith("http")]; internal = [h for h in hrefs if h.startswith(BASE)]
    bad = [(h, status(h)) for h in ext if status(h) != 200]
    print("external links:", len(ext), "| not 200:", bad or "none")
    badi = []
    for h in internal:
        try: urllib.request.urlopen(h.split("#")[0], timeout=10)
        except Exception as e: badi.append(h)
    print("internal links:", len(internal), "| failing:", badi or "none")
    noalt = pg.evaluate("[...document.images].filter(i=>!i.alt && !i.closest('[aria-hidden=true]') && !i.closest('.stage')).map(i=>i.src.split('/').pop())")
    print("images without alt outside decorative areas:", noalt or "none")
    print("alt text:", pg.evaluate("[...document.images].filter(i=>i.alt).map(i=>i.src.split('/').pop()+' => '+i.alt)"))
    print("contrast failures:", pg.evaluate(CONTRAST_JS) or "none")
    # focus ring on the new links and the Apply pill
    for sel in (".iam a", ".hero__ctas .pill", ".hero__find input"):
        pg.focus(sel); pg.keyboard.press("Shift+Tab"); pg.keyboard.press("Tab")
        ring = pg.evaluate("(()=>{const e=document.activeElement;const c=getComputedStyle(e);return {tag:e.className||e.tagName, outline:c.outlineStyle+' '+c.outlineWidth, shadow:c.boxShadow.slice(0,40)}})()")
        print("focus", sel, ring)
    pg.close()
    # --- reduced motion collapses the chapters
    pg = b.new_page(viewport={"width": 1440, "height": 900}, reduced_motion="reduce"); pg.goto(BASE + "index.html", wait_until="load")
    print("reduced motion: stage display =", pg.evaluate("getComputedStyle(document.querySelector('.stage')).display"), "| chapter cards stacked =", pg.evaluate("getComputedStyle(document.querySelector('.chapter-card')).display"), "| wordmark animation =", pg.evaluate("getComputedStyle(document.querySelector('.wordmark__fill')).animationName"))
    pg.close(); b.close()
