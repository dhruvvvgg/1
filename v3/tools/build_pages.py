"""Build connected static pages from homepage chrome, page bodies and directory data."""
from pathlib import Path
from html import escape
import json,re
ROOT=Path(__file__).resolve().parents[1]
home=(ROOT/'index.html').read_text()
prefix=home[:home.index('<main id="main">')]
suffix=home[home.index('<!-- Footer -->'):]
meta={
 'admissions':('Admissions','Explore admission routes, application preparation, scholarships and admissions contacts at SRMIST.'),
 'academics':('Academics','Explore academic areas, study levels and admission pathways at SRM Institute of Science and Technology.'),
 'placements':('Placements','Explore career preparation, practical experience and recruiter examples at SRMIST.'),
 'research':('Research','Explore academic research, shared facilities, doctoral study and innovation at SRMIST.'),
 'campus-life':('Campus life','Explore student communities, festivals, living arrangements, support and visiting SRMIST Kattankulathur.')}
areas=json.loads((ROOT/'data/areas.json').read_text())
area_html='\n'.join(f'''<details class="subject" id="{a['id']}" data-filter-item data-interest="{a['interest']}" data-search="{escape(a['name']+' '+a['summary'],quote=True)}"><summary><span class="subject__name">{escape(a['name'])}</span><span class="subject__plus" aria-hidden="true">+</span></summary><div class="subject__body"><p>{escape(a['summary'])}</p><p>{escape(a['detail'])}</p><a class="more" href="admissions.html?area={a['route']}#routes">Explore admission route</a></div></details>''' for a in areas)
recruiters=json.loads((ROOT/'data/recruiters.json').read_text())
recruiter_html='\n'.join(f'''<li data-filter-item data-search="{escape(a['name'],quote=True)}"><img src="assets/img/partners/{a['image']}" alt="" width="300" height="200" loading="lazy"><span>{escape(a['name'])}</span></li>''' for a in recruiters)
for slug,(title,desc) in meta.items():
 body=(ROOT/'pages'/f'{slug}.html').read_text().replace('<!-- AREAS -->',area_html).replace('<!-- RECRUITERS -->',recruiter_html)
 first_image=re.search(r'<img src="([^"]+)"',body).group(1)
 pre=re.sub(r'<title>.*?</title>',f'<title>{title} | SRMIST Concept</title>',prefix)
 pre=re.sub(r'<meta name="description" content="[^"]+">',f'<meta name="description" content="{desc}">',pre)
 pre=re.sub(r'<link rel="preload" as="image"[^>]+>',f'<link rel="preload" as="image" href="{first_image}">',pre)
 pre=pre.replace('<link rel="stylesheet" href="assets/css/site.css">','<link rel="stylesheet" href="assets/css/site.css">\n<link rel="stylesheet" href="assets/css/pages.css">')
 nav=re.search(r'<nav class="nav".*?</nav>',pre,re.S).group()
 pre=pre.replace(nav,nav.replace(f'href="{slug}.html"',f'href="{slug}.html" aria-current="page"'))
 ending=suffix.replace('<script src="assets/js/site.js" defer></script>', '<script src="assets/js/site.js" defer></script>\n<script src="assets/js/pages.js" defer></script>')
 page=pre+'<main id="main">\n'+body+'\n</main>\n\n'+ending
 dimensions={'commons-tech-park.webp':848,'commons-srm-university-campus-chennai-tamil-nadu-india.webp':786,'commons-bihu-team.webp':695,'commons-0j9a0195.webp':853}
 for image,height in dimensions.items():
  page=re.sub(r'(<img src="assets/img/'+re.escape(image)+r'"[^>]*?width="1280" height=")\d+',lambda m:m[1]+str(height),page)
 (ROOT/f'{slug}.html').write_text(page)
# Keep the older engineering-page URL usable with the new global navigation.
legacy=ROOT/'page.html'
s=legacy.read_text();main=re.search(r'<main id="main">[\s\S]*?</main>',s).group()
main=main.replace('https://www.srmist.edu.in/departments/', 'academics.html#areas').replace('https://www.srmist.edu.in/admissions/', 'admissions.html#routes').replace(' data-ext', '')
legacy_prefix=re.sub(r'<title>.*?</title>','<title>Engineering and Technology | SRMIST Concept</title>',prefix)
legacy_image=re.search(r'<img src="([^"]+)"',main).group(1)
legacy_prefix=re.sub(r'<link rel="preload" as="image"[^>]+>', f'<link rel="preload" as="image" href="{legacy_image}">', legacy_prefix)
legacy.write_text(legacy_prefix+main+'\n\n'+suffix)
print('Built',len(meta),'connected pages and refreshed legacy navigation.')
