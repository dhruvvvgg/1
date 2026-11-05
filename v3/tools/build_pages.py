"""Build the five inner pages and keep the shared chrome (header, menu, footer links) identical on every page.
Usage (from v3/): python tools/build_pages.py
Chrome is regenerated on index.html and page.html as well, so internal links point to these pages, not the official site.
All facts come from srmist.edu.in (checked 5 November 2026); each page names its source.
"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(n): return open(os.path.join(ROOT, n), encoding="utf-8").read()
def wr(n, s): open(os.path.join(ROOT, n), "w", encoding="utf-8").write(s)

OFFICIAL = "https://www.srmist.edu.in/"

NAV = [("academics.html", "Academics"), ("admissions.html", "Admissions"), ("research.html", "Research"),
       ("placements.html", "Placements"), ("campus-life.html", "Campus life"), ("page.html", "About")]

MENU = [
 ("Academics", [("academics.html#areas", "Colleges and areas of study"), ("academics.html#finder", "Find a programme"), ("academics.html#accreditation", "Accreditation"), ("academics.html#online", "Online and distance")]),
 ("Admissions", [("admissions.html#routes", "Indian applicants"), ("admissions.html#international", "International applicants"), ("admissions.html#programmes", "Programmes open"), ("admissions.html#contact", "Contact admissions")]),
 ("Research", [("research.html#centres", "Research centres"), ("research.html#innovation", "Innovation and incubation"), ("research.html#policies", "Policies and ethics"), ("research.html#dean", "Dean, Research")]),
 ("Placements", [("placements.html#results", "Placement results"), ("placements.html#recruiters", "Recruiters"), ("placements.html#career-centre", "Career Centre"), ("placements.html#contact", "Contact")]),
 ("Campus life", [("campus-life.html#sports", "Sports"), ("campus-life.html#hostels", "Hostels and dining"), ("campus-life.html#culture", "Clubs and festivals"), ("campus-life.html#care", "Student support")]),
]

def chrome(active):
    nav = "\n".join(f'      <a href="{h}"' + (' aria-current="page"' if h == active else "") + f">{t}</a>" for h, t in NAV)
    groups = "\n".join(f'      <div><h2>{g}</h2><ul>' + "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in items) + "</ul></div>" for g, items in MENU)
    return f'''<header class="header">
  <div class="wrap">
    <a class="brand" href="index.html"><img src="assets/img/srm-logo.svg" alt="SRM Institute of Science and Technology, home" width="156" height="52"></a>
    <nav class="nav" aria-label="Main">
{nav}
    </nav>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-open>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>
      <span class="sr-only">Open menu</span>
    </button>
  </div>
</header>

<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden data-menu>
  <div class="wrap">
    <div class="menu__top">
      <a class="brand" href="index.html"><img src="assets/img/srm-logo.svg" alt="SRM Institute of Science and Technology, home" width="156" height="52"></a>
      <button class="menu-btn" type="button" data-menu-close>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        <span class="sr-only">Close menu</span>
      </button>
    </div>
    <div class="menu__grid ui">
{groups}
    </div>
    <div class="menu__cta"><a class="pill pill--accent" href="admissions.html#routes">Apply</a><a class="pill" href="admissions.html#contact">Request info</a><a class="pill" href="campus-life.html#visit">Visit campus</a></div>
  </div>
</div>

'''

FOOT_MAP = {
 'https://www.srmist.edu.in/admission-india/">Programmes': 'academics.html">Programmes',
 'https://www.srmist.edu.in/admissions/">Admissions 2027': 'admissions.html">Admissions 2027',
 'https://www.srmist.edu.in/admission-india/engineering/scholarships/">Scholarships': 'admissions.html#international">Scholarships and fee waivers',
 'https://www.srmist.edu.in/admission-international/">International students': 'admissions.html#international">International students',
 'https://www.srmist.edu.in/contact-us/">Contact admissions': 'admissions.html#contact">Contact admissions',
 'index.html#visit">Visit campus': 'campus-life.html#visit">Visit campus',
 'https://www.srmist.edu.in/life-at-srm/student-counselling-services/">Student support': 'campus-life.html#care">Student support',
 'https://www.srmist.edu.in/life-at-srm/anti-ragging/">Anti-ragging': 'campus-life.html#care">Anti-ragging',
 'https://www.srmist.edu.in/research/">Research': 'research.html">Research',
 'https://www.srmist.edu.in/about-us/">About SRMIST': 'page.html">About SRMIST',
 'https://www.srmist.edu.in/life-at-srm/">Life at SRM': 'campus-life.html">Life at SRM',
 'https://www.srmist.edu.in/life-at-srm/student-life/clubs/">Clubs and societies': 'campus-life.html#culture">Clubs and societies',
 'https://www.srmist.edu.in/life-at-srm/sports/">Sports': 'campus-life.html#sports">Sports',
 'https://www.srmist.edu.in/placements/">Placements': 'placements.html">Placements',
}

def apply_chrome(html, active):
    a = html.index('<header class="header">'); b = html.index("<main")
    html = html[:a] + chrome(active) + html[b:]
    f0 = html.index("<footer class=\"footer\""); f1 = html.index("</footer>", html.index("campus-ending")) + 9
    foot = html[f0:f1]
    for k, v in FOOT_MAP.items(): foot = foot.replace(k, v)
    return html[:f0] + foot + html[f1:]

# ---------- shared page shell, cut from page.html so every page has the same head and footer
tpl = rd("page.html")
FOOT = tpl[tpl.index('<!-- Footer'):]
CONCEPT = tpl[tpl.index('<a class="skip"'): tpl.index('<header class="header">')]

CLOSER = '''  <section class="closer" aria-labelledby="closer-title">
    <div class="wrap closer__in">
      <h2 id="closer-title">Your place at SRM starts here.</h2>
      <div class="closer__ctas">
        <a class="pill pill--ink" href="admissions.html#routes">Apply</a>
        <a class="pill pill--line" href="admissions.html#contact">Request info</a>
        <a class="pill pill--line" href="campus-life.html#visit">Visit campus</a>
      </div>
    </div>
  </section>'''

def page(fname, title, desc, body, active=None):
    body = body + '\n' + CLOSER
    head = tpl[:tpl.index("</head>")]
    head = re.sub(r"<title>.*?</title>", f"<title>{title}, SRMIST Concept</title>", head)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', head)
    html = (head + "</head>\n<body>\n" + CONCEPT + '<header class="header"></header>\n' + f'<main id="main">\n{body}\n</main>\n\n' + FOOT)
    wr(fname, apply_chrome(html, fname))

OFF = "Photo: SRMIST, srmist.edu.in"
CRED = {
 "adm": ("off-admissions.webp", OFF), "mgmt": ("off-management.webp", OFF), "arch": ("off-architecture.webp", OFF), "law": ("off-law-students.webp", OFF),
 "dent": ("off-dentistry.webp", OFF), "agri": ("off-agriculture.webp", OFF), "med": ("off-medicine-lab.webp", OFF), "conv": ("off-convocation.webp", OFF),
 "formula": ("off-formula-bharat.webp", OFF), "lab": ("lab-research.webp", OFF), "milan": ("milan-stage.webp", OFF),
 "campus": ("srm-university-campus-chennai-tamil-nadu.webp", "Photo: N. Vivekananthamoorthy, CC BY 4.0"),
 "tech": ("tech-park.webp", "Photo: Syed Tehzeeb Alam, CC BY-SA 4.0"),
 "audi": ("srm-university-auditorium.webp", "Photo: Hareesh Sivasubramanian, CC BY-SA 3.0"),
 "bio": ("biotech-block-1.webp", "Photo: Cdinesh, public domain"),
 "old": ("old-campus-srm-institute-of-science-and-.webp", "Photo: Annni07, CC BY-SA 3.0"),
 "stage": ("../commons-a22wcmt.webp", "Photo: Rishitshivesh1017, CC BY-SA 4.0"),
 "bihu": ("../commons-bihu-team.webp", "Photo: Arnab J Deka, CC BY-SA 3.0"),
 "aerial": ("../srmist-aerial-official.webp", OFF),
}
HERO_IMG = {"Admissions": "mgmt", "Academics": "arch", "Placements": "conv", "Research": "lab", "Campus life": "campus"}
BAND_IMG = {}

def bgimg(key, eager=False):
    f, c = CRED[key]
    return f'<img class="bgsec__img" src="assets/img/bg/{f}" alt="" width="1920" height="1080"' + ('' if eager else ' loading="lazy"') + ' decoding="async">', ''

def hero(crumb, h1, lead):
    img, cred = bgimg(HERO_IMG[crumb], eager=True)
    return f'''  <section class="bgsec bgsec--hero" aria-labelledby="hero-h1">
    {img}
    <div class="wrap bgsec__in">
      <h1 id="hero-h1">{h1}</h1>
      <p>{lead}</p>
    </div>
    {cred}
  </section>'''

def photo_band(h2, sentence, key, link=None, id_=None, extra=""):
    img, cred = bgimg(key)
    l = f'<a class="more" href="{link[0]}"' + (' data-ext' if link[0].startswith("http") else "") + f'>{link[1]}</a>' if link else ""
    i = f' id="{id_}"' if id_ else ""
    return f'''  <section class="bgsec bgsec--band"{i} aria-labelledby="{(id_ or "pb")}-t">
    {img}
    <div class="wrap bgsec__in">
      <h2 id="{(id_ or "pb")}-t">{h2}</h2>
      <p>{sentence}</p>
      {l}
      {extra}
    </div>
    {cred}
  </section>'''

def shead(h2, sentence, link=None, id_=None):
    l = f'\n      <a class="more" href="{link[0]}">{link[1]}</a>' if link else ""
    i = f' id="{id_}"' if id_ else ""
    return f'''    <div class="s-head">
      <h2{i}>{h2}</h2>
      <p>{sentence}</p>{l}
    </div>'''

def split(img, alt, w, h, inner, cls=""):
    return f"""<div class="split {cls}"><div class="split__text">{inner}</div><figure class="split__fig"><img src="assets/img/{img}" alt="{alt}" width="{w}" height="{h}" loading="lazy"></figure></div>"""

def band(h2, sentence, stats, src_href, src_text):
    dl = "".join(f"<div><dt>{t}</dt><dd>{n}</dd></div>" for n, t in stats)
    key = BAND_IMG.get(h2)
    img, cred = bgimg(key) if key else ("", "")
    cls = "stat-band bgsec bgsec--stats" if key else "stat-band"
    return f'''  <section class="{cls}" aria-labelledby="band-title">
    {img}
    <div class="wrap bgsec__in">
      <h2 id="band-title">{h2}</h2>
      <p>{sentence}</p>
      <dl class="stats">{dl}</dl>
    </div>
    {cred}
  </section>'''

SRC = lambda *a, **k: ''

# =====================================================================  ADMISSIONS
rows = [
 ("Engineering and Technology", "B.Tech and M.Tech (Integrated). B.Tech after a diploma. M.Tech (flexible timing). PG Diploma in Genetic Counseling."),
 ("Medicine and Health Sciences", "Health science undergraduate and postgraduate programmes, super speciality admissions, and PhD admissions through the Division of Medical Research."),
 ("Liberal Arts and Business Studies", "Formerly Science and Humanities. Undergraduate B.A., B.Sc., B.Ed., BS, B.Com, BCA and diplomas. Postgraduate M.A., M.Com, M.Sc., M.C.A. and M.S.W. Also a Diploma in Music Teacher Training, a Certificate in Music and Dance, and a PG Diploma in Journalism."),
 ("Hotel and Catering Management", "Undergraduate and postgraduate programmes."),
 ("Agricultural Sciences", "Programmes from the College of Agriculture Sciences."),
 ("Law", "Five-year integrated law courses."),
 ("Doctoral study", "Ph.D. programmes in all schools and faculties."),
]
idx = "".join(f'<li><h3>{a}</h3><p>{b}</p></li>' for a, b in rows)
adm = hero("Admissions", "Admissions", "Apply to SRM Institute of Science and Technology as an applicant from India or from abroad.") + f'''

  <section class="section section--tight wrap" id="routes" aria-labelledby="routes-title">
{shead("Choose your route.", "Applications, eligibility and fees depend on where you apply from.", None, "routes-title")}
    <div class="routes">
      <article class="route">
        <h3>Applicants from India</h3>
        <p>Pick a programme area below. Each one lists its programmes, fees, eligibility and selection criteria.</p>
        <a class="pill pill--accent" href="https://www.srmist.edu.in/admission-india/" data-ext>Apply from India</a>
      </article>
      <article class="route">
        <h3>International applicants</h3>
        <p>Applications for 2027 admission are open to students from around the world, with fee waivers for eligible applicants.</p>
        <a class="pill pill--accent" href="https://www.srmist.edu.in/admission-international/" data-ext>Apply from abroad</a>
      </article>
    </div>
  </section>

  <section class="section section--tight wrap" id="programmes" aria-labelledby="programmes-title">
{shead("Programmes for Indian applicants.", "Each area has its own admission page on the official site.", None, "programmes-title")}
    <ul class="index index--text">{idx}</ul>
    {SRC(OFFICIAL + "admission-india/", "srmist.edu.in/admission-india")}
  </section>

{band("International fee waivers.", "Eligible international applicants can reduce their fees in three ways.", [("40%", "Fee waiver with an SAT score, or 70% and above in HSC grades"), ("65%", "Fee waiver for Engineering, for applicants from Africa, Asia and SAARC"), ("50%", "Fee waiver for other programmes, for applicants from Africa, Asia and SAARC")], OFFICIAL + "admission-international/", "srmist.edu.in/admission-international").replace('<section class="stat-band"', '<section class="stat-band" id="international"')}

  <section class="section section--tight wrap" id="contact" aria-labelledby="contact-title">
{shead("Contact admissions.", "Reach the Directorate of Admissions on the main SRMIST line, or use the official contact page.", ("https://www.srmist.edu.in/contact-us/", "Official contact page"), "contact-title")}
    <div class="notice">
      <h3>Use only the official website</h3>
      <p>SRMIST's only official website is www.srmist.edu.in. If you find another website that promises admission to SRM, write to <a href="mailto:cyberwatchdog@srmist.edu.in">cyberwatchdog@srmist.edu.in</a> so the university can warn students and parents.</p>
    </div>
    <p class="note-line">SRM Nagar, Kattankulathur 603203, Chengalpattu District, Tamil Nadu. Phone +91 44 2741 7000.</p>
  </section>

  <section class="section section--tight wrap" id="tour" aria-labelledby="tour-title">
{shead("See the campus before you apply.", "Take the 360-degree virtual tour of the Kattankulathur campus, or plan a visit.", ("https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm", "360 degree virtual tour"), "tour-title")}
  </section>'''
page("admissions.html", "Admissions", "How to apply to SRM Institute of Science and Technology: routes for Indian and international applicants, programmes open, and fee waivers.", adm)

# =====================================================================  ACADEMICS
clusters = [
 ("Engineering and design", [("Engineering and Technology", "college/college-of-engineering-technology/"), ("Architecture", "department/department-of-architecture/")]),
 ("Health sciences", [("Medicine and Health Sciences", "college/medicine-and-health-sciences/"), ("Dentistry", "https://dental.srmist.edu.in/"), ("Pharmacy", "department/college-of-pharmacy/"),
                      ("Nursing", "department/college-of-nursing/"), ("Public Health", "department/school-of-public-health/"), ("Physiotherapy", "department/college-of-physiotherapy/"),
                      ("Occupational Therapy", "department/college-of-occupational-therapy/")]),
 ("Management and law", [("Management", "faculty-of-management/"), ("Law", "https://law.srmist.edu.in/"), ("Hotel and Catering Management", "department/institute-of-hotel-and-catering-management/")]),
 ("Sciences and humanities", [("Science and Humanities", "college/college-of-science-and-humanities/"), ("Agriculture Sciences", "department/college-of-agriculture-sciences/")]),
]
def ahref(h): return h if h.startswith("http") else OFFICIAL + h
TILE_IMG = {"Engineering and Technology": "off-formula-bharat", "Architecture": "off-architecture", "Medicine and Health Sciences": "off-medicine-lab", "Dentistry": "off-dentistry",
            "Pharmacy": "lab-research", "Nursing": "off-medicine-lab", "Public Health": "off-medicine-lab", "Physiotherapy": "off-dentistry", "Occupational Therapy": "off-medicine-lab",
            "Management": "off-management", "Law": "off-law-students", "Hotel and Catering Management": "off-management", "Science and Humanities": "lab-research", "Agriculture Sciences": "off-agriculture"}
cols = "".join(f'<li data-area><a class="tile" href="{ahref(h)}" data-ext><img class="tile__img" src="assets/img/bg/{TILE_IMG[n]}.webp" alt="" width="1920" height="1275" loading="lazy" decoding="async"><span>{n}</span></a></li>' for g, items in clusters for n, h in items)
acc = [("IET", "B.Tech Computer Science and Engineering, Software Engineering, Electronics and Instrumentation Engineering, and Automobile Engineering (Kattankulathur campus)."),
       ("ABET, Engineering", "B.Tech Civil Engineering, Mechanical Engineering, Electrical and Electronics Engineering, and Electronics and Communication Engineering (Kattankulathur campus)."),
       ("ABET, Computing", "B.Tech Information Technology (Kattankulathur campus).")]
alis = "".join(f'<li><h3>{a}</h3><p>{b}</p></li>' for a, b in acc)
acad = hero("Academics", "Academics", "Nine colleges and over 300 programmes share one multidisciplinary university.") + f"""

  <section class="section wrap" aria-labelledby="numbers-title">
{shead("One university, many ways to study.", "From engineering and medicine to law, management and agriculture, SRMIST teaches across disciplines.", None, "numbers-title")}
    <dl class="figures">
      <div><dd>9</dd><dt>Colleges</dt></div>
      <div><dd>111+</dd><dt>Departments</dt></div>
      <div><dd>300+</dd><dt>Programmes</dt></div>
      <div><dd>3,200+</dd><dt>Academicians</dt></div>
    </dl>
  </section>

  <section class="section wrap" id="areas" aria-labelledby="areas-title">
{shead("Areas of study.", "Find your area, then open its college page for programmes, fees and eligibility.", None, "areas-title")}
    <div class="finder" id="finder">
      <label class="finder__label" for="finder-q">Find an area of study</label>
      <input class="finder__input" id="finder-q" type="search" placeholder="Try law, nursing or engineering" autocomplete="off" data-filter="[data-area]" data-filter-empty="finder-empty">
    </div>
    <ul class="tiles">{cols}</ul>
    <p class="finder__empty" id="finder-empty" hidden>No area matches that search. Try a broader word, such as science or health.</p>
  </section>

  <section class="section wrap" id="accreditation" aria-labelledby="accr-title">
{shead("Accredited where it counts.", "NAAC accredited SRMIST with its highest grade, A++, in 2024. Engineering and computing programmes carry international accreditation.", ("https://www.srmist.edu.in/about-us/accreditations-and-rankings/", "All rankings and accreditations"), "accr-title")}
    <ul class="index index--text">{alis}</ul>
  </section>

  <section class="section wrap" id="online" aria-labelledby="online-title">
{shead("Study online or at a distance.", "SRMIST runs online and distance education through its Directorate of Online and Distance Education.", None, "online-title")}
    <ul class="index">
      <li><h3>Online education</h3><a class="more" href="https://www.srmonline.in/" data-ext>SRM Online</a></li>
      <li><h3>Distance education</h3><a class="more" href="https://srmistdistanceeducation.in/" data-ext>SRM Distance Education</a></li>
    </ul>
  </section>"""
page("academics.html", "Academics", "Colleges, areas of study, accreditation and online learning at SRM Institute of Science and Technology.", acad)

# =====================================================================  PLACEMENTS
logos = ["abb", "accenture", "accolite", "aditya-birla", "Afcons", "Affinsys", "microsoft", "mckinley_rice", "maruthi", "mu_sigma", "maersk", "ltimindtree",
         "tcs", "infosys", "wipro", "cognizant", "capgemini", "deloitte", "ey", "pwc", "amazon", "ibm", "sap", "hcl", "hsbc", "jp_morgan", "siemens", "honeywell",
         "ford", "intel"]
names = {"abb": "ABB", "accenture": "Accenture", "accolite": "Accolite", "aditya-birla": "Aditya Birla Group", "Afcons": "Afcons", "Affinsys": "Affinsys", "microsoft": "Microsoft",
         "mckinley_rice": "McKinley Rice", "maruthi": "Maruti Suzuki", "mu_sigma": "Mu Sigma", "maersk": "Maersk", "ltimindtree": "LTIMindtree", "tcs": "TCS", "infosys": "Infosys",
         "wipro": "Wipro", "cognizant": "Cognizant", "capgemini": "Capgemini", "deloitte": "Deloitte", "ey": "EY", "pwc": "PwC", "amazon": "Amazon", "ibm": "IBM", "sap": "SAP",
         "hcl": "HCL", "hsbc": "HSBC", "jp_morgan": "J.P. Morgan", "siemens": "Siemens", "honeywell": "Honeywell", "ford": "Ford", "hyundai": "Hyundai", "intel": "Intel",
         "nokia": "Nokia", "Shell": "Shell", "hitachi": "Hitachi"}
wall = "".join(f'<li><img src="assets/img/partners/{n}.jpg" alt="{names[n]}" width="300" height="200" loading="lazy"></li>' for n in logos)
plc = hero("Placements", "Placements", "The Career Centre brings recruiters to campus and prepares students to meet them.") + f'''

{band("Placement results, 2025 batch.", "Offers and packages for the batch that graduated in 2025.", [("10,190+", "Job offers"), ("1,448+", "Job roles recruited for"), ("4,346+", "High-paying offers"), ("61 LPA", "Highest CTC"), ("6.5 LPA", "Average CTC")], OFFICIAL + "placements/", "srmist.edu.in/placements").replace('<section class="stat-band"', '<section class="stat-band" id="results"')}

  <section class="section section--tight wrap" id="recruiters" aria-labelledby="rec-title">
{shead("Who hires from SRM.", "980+ companies recruit from SRM. A few of them are shown here.", None, "rec-title")}
    <ul class="partners partners--wall" aria-label="Recruiters that hire SRM graduates">{wall}</ul>
  </section>

  <section class="section section--tight wrap" id="career-centre" aria-labelledby="cc-title">
{shead("The Career Centre.", "It combines the Placement Office and the Career Development Centre.", None, "cc-title")}
    <div class="routes">
      <article class="route">
        <h3>Placement Office</h3>
        <p>Runs placement and training, with workshops, hackathons, quizzes, conferences, expert talks, internships and industrial visits, so students are market ready by graduation.</p>
      </article>
      <article class="route">
        <h3>Career Development Centre</h3>
        <p>Helps students identify their interests and capabilities in relation to career goals and academic progression, with coaching in personality development and leadership.</p>
      </article>
    </div>
  </section>

  <section class="section section--tight wrap" id="contact" aria-labelledby="pc-title">
{shead("Recruiting from SRM?", "Write or call the Career Centre to plan a campus visit or a recruitment drive.", ("https://www.srmist.edu.in/career-centre/", "Career Centre on the official site"), "pc-title")}
    <dl class="facts facts--2">
      <div><dt>Address</dt><dd>15th Floor, Tech Tower II, SRMIST Campus, SRM Nagar, Kattankulathur, Chengalpattu Dist., Tamil Nadu 603 203</dd></div>
      <div><dt>Email</dt><dd><a href="mailto:placement@srmist.edu.in">placement@srmist.edu.in</a></dd></div>
      <div><dt>Phone</dt><dd>+91 44 2745 5774 or +91 44 2745 2270, extension 7301</dd></div>
    </dl>
  </section>'''
page("placements.html", "Placements", "Placement results, recruiters and the Career Centre at SRM Institute of Science and Technology.", plc)

# =====================================================================  RESEARCH
centres = [
 ("Central Research Laboratories and Facilities", "Shared facilities that bring scholars and students from different study areas together to work on common problems."),
 ("Interdisciplinary Institute of Indian System of Medicine", "Set up in 2008 to promote research in the traditional systems of Indian medicine, including Siddha, Ayurveda and Unani."),
 ("REACH", "The Center for Research in Environment, Sustainability Advocacy and Climate Change, started at the Kattankulathur campus to build a university-wide environment of research excellence."),
]
cl = "".join(f'<li><h3>{a}</h3><p>{b}</p></li>' for a, b in centres)
res = hero("Research", "Research", "SRMIST's research centres work together on applied and cross-disciplinary projects, from patentable ideas to prototypes and incubated companies.") + f'''

{band("Research at SRMIST.", "Faculty and students publish and patent across disciplines.", [("58,000+", "Publications"), ("1,100+", "Patents")], OFFICIAL, "srmist.edu.in")}

  <section class="section section--tight wrap" id="centres" aria-labelledby="centres-title">
{split("bg/off-medicine-lab.webp", "Students and staff working in a laboratory", 1920, 1275, shead("Where the work happens.", "A large multidisciplinary campus lets researchers from different fields work on the same questions.", ("https://www.srmist.edu.in/research/", "Research on the official site"), "centres-title"))}
    <ul class="index index--text">{cl}</ul>
    <p class="note-line">SRMIST also organises conferences, seminars and workshops, and funds socially relevant research projects taken up by students.</p>
  </section>

  <section class="section section--tight wrap" id="innovation" aria-labelledby="innov-title">
{split("bg/ideathon.webp", "Students receiving an award at an SRM innovation event", 1375, 917, shead("From research to start-up.", "The SRMIST Startup Ecosystem offers incubation centres and a mentorship network that connects founders with industry experts.", ("https://www.srmist.edu.in/srmist-startup-ecosystem/", "Startup ecosystem"), "innov-title"))}
  </section>

  <section class="section section--tight wrap" id="policies" aria-labelledby="pol-title">
{shead("Policies and ethics.", "The university publishes the rules that govern research on campus.", None, "pol-title")}
    <ul class="index index--text">
      <li><h3>Policy on Promotion of Research</h3><p>How the university supports researchers.</p></li>
      <li><h3>Policy on Chemical and Hazardous Waste disposal</h3><p>How laboratories handle hazardous material.</p></li>
      <li><h3>Institutional Code of Ethics for Research</h3><p>The standards researchers are held to.</p></li>
    </ul>
  </section>

  <section class="section section--tight wrap" id="dean" aria-labelledby="dean-title">
{shead("Contact the Dean, Research.", "Write to the Dean for research collaborations and enquiries.", None, "dean-title")}
    <dl class="facts facts--2">
      <div><dt>Dean, Research</dt><dd>Dr. Bernaurdshaw Neppolian</dd></div>
      <div><dt>Email</dt><dd><a href="mailto:dean.research@srmist.edu.in">dean.research@srmist.edu.in</a></dd></div>
    </dl>
    {SRC(OFFICIAL + "research/", "srmist.edu.in/research")}
  </section>'''
page("research.html", "Research", "Research centres, innovation and incubation, and research policies at SRM Institute of Science and Technology.", res)

# =====================================================================  CAMPUS LIFE
HOSTELS = '<ul class="index">' + "".join(f'<li><h3>{n}</h3><a class="more" href="{u}" data-ext>{l}</a></li>' for n, u, l in [("Hostel for men", OFFICIAL + "srm-hostels/hostel-for-men/", "Hostel page"), ("Hostel for women", OFFICIAL + "srm-hostels/hostel-for-women/", "Hostel page"), ("International hostel", OFFICIAL + "srm-hostels/international-hostel/", "Hostel page"), ("Dining and eateries", OFFICIAL + "srm-hostels/dining-eateries/", "Dining page")]) + "</ul>"
life = hero("Campus life", "Campus life", "Sports, hostels, festivals and student support on a green campus of more than 250 acres.") + f"""

  <section class="section wrap" id="sports" aria-labelledby="sp-title">
{split("srmist-sports-official.webp", "SRMIST students on a sports field", 651, 434, shead("Sports and fitness.", "There are activities for every interest, from sport to fine arts and entrepreneurship. SRMIST sports students have secured prestigious public-sector positions.", ("https://www.srmist.edu.in/life-at-srm/sports/", "Sports at SRM"), "sp-title"))}
  </section>

  <section class="section wrap" id="hostels" aria-labelledby="ho-title">
{split("bg/hostel-kalpana.webp", "The Kalpana Chawla hostel block on the SRMIST campus", 1400, 1800, shead("Hostels and dining.", "SRMIST provides housing in several room types, with an emphasis on safety, and a range of mess facilities and cafeterias.", None, "ho-title") + HOSTELS)}
  </section>

{photo_band("Clubs and festivals.", "Cultural events, student clubs and technical teams keep the campus busy long after classes end. Aaruush is SRM's techno-management fest, and Milan is its cultural festival.", "milan", ("https://www.srmist.edu.in/life-at-srm/student-life/clubs/", "Clubs and societies"), "culture")}

  <section class="section wrap" id="care" aria-labelledby="ca-title">
{shead("Student support and safety.", "Walking and cycling are the popular ways to get around, with campus security and 24-hour emergency services.", None, "ca-title")}
    <div class="routes">
      <article class="route"><h3>Counselling and support</h3><p>The university offers student counselling and a Socio-Economically Disadvantaged Groups (SEDG) Cell.</p><a class="more" href="https://www.srmist.edu.in/life-at-srm/student-counselling-services/" data-ext>Counselling services</a></article>
      <article class="route"><h3>Anti-ragging</h3><p>SRM strongly condemns ragging in any form. Students welcome freshers with flowers and advice.</p><a class="more" href="https://www.srmist.edu.in/life-at-srm/anti-ragging/" data-ext>Anti-ragging committee</a></article>
    </div>
  </section>

{photo_band("Visit the campus.", "See the Kattankulathur campus beside its lake, or take the 360-degree virtual tour first.", "aerial", ("https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm", "360 degree virtual tour"), "visit")}"""
page("campus-life.html", "Campus life", "Sports, hostels, festivals, student support and visiting the Kattankulathur campus of SRM Institute of Science and Technology.", life)

# =====================================================================  ABOUT
HERO_IMG["About"] = "campus"
faculties = ["Engineering and Technology", "Management", "Medicine and Health Sciences", "Science and Humanities", "Law", "Agricultural Sciences"]
fl = "".join(f'<li><h3>{f}</h3><a class="more" href="academics.html#areas">Areas of study</a></li>' for f in faculties)
campuses = [("In and around Chennai", "Kattankulathur, Ramapuram, Vadapalani and Baburayanpettai."),
            ("Elsewhere in Tamil Nadu", "Tiruchirappalli."),
            ("Near Delhi NCR", "Modinagar in Uttar Pradesh, and Sonepat in Haryana."),
            ("Andhra Pradesh", "Amaravati."), ("Sikkim", "Gangtok.")]
cl = "".join(f'<li><h3>{a}</h3><p>{b}</p></li>' for a, b in campuses)
values = [("Excellence, integrity and academic freedom", "The standards the university holds itself and its students to."),
          ("Global vision and local commitment", "Learning with the world, rooted in the communities around each campus."),
          ("Inclusiveness, diversity, compassion and mutual respect", "A campus where students from many backgrounds study side by side.")]
vl = "".join(f'<li><h3>{a}</h3></li>' for a, b in values)
abt = hero("About", "About SRMIST", "A multidisciplinary university that began as one engineering college at Kattankulathur, near Chennai, and now has campuses across five Indian states.") + f"""

  <section class="section wrap" id="who" aria-labelledby="who-title">
{split("bg/srm-university-campus-chennai-tamil-nadu.webp", "Aerial view of the Kattankulathur campus and its green surroundings after rain", 1920, 1179, shead("Who we are.", "SRM Institute of Science and Technology is one of India's leading universities. It teaches undergraduate, postgraduate and doctoral programmes in six faculties, on campuses in Tamil Nadu, Uttar Pradesh, Haryana, Andhra Pradesh and Sikkim.", ("academics.html", "Colleges and programmes"), "who-title"))}
  </section>

  <section class="section wrap" id="vision" aria-labelledby="vision-title">
{shead("Vision and mission.", "What the university sets out to be, and how it plans to get there.", None, "vision-title")}
    <div class="routes">
      <article class="route">
        <h3>Vision</h3>
        <p>To emerge as a world-class university in creating and disseminating knowledge, and in giving students a unique learning experience in science, technology, medicine, management and other areas of scholarship, to best serve the world and the betterment of mankind.</p>
      </article>
      <article class="route">
        <h3>Mission</h3>
        <p><strong>Move up</strong> through international alliances and collaborative initiatives to achieve global excellence.</p>
        <p><strong>Accomplish a process</strong> to advance knowledge in a rigorous academic and research environment.</p>
        <p><strong>Attract and build people</strong> in a rewarding and inspiring environment, by fostering freedom, empowerment, creativity and innovation.</p>
      </article>
    </div>
  </section>

  <section class="section wrap" id="values" aria-labelledby="values-title">
{shead("Core values.", "Three commitments run through the university's work.", None, "values-title")}
    <ul class="index">{vl}</ul>
  </section>

  <section class="section wrap" id="history" aria-labelledby="history-title">
{shead("How SRM grew.", "The SRM Group began in 1968. The university's own story starts in 1985.", ("https://www.srmist.edu.in/about-us/", "History on the official site"), "history-title")}
    <ol class="timeline timeline--wide">
      <li><b>1968</b><span>The SRM Group of institutions is founded.</span></li>
      <li><b>1985</b><span>SRM Engineering College opens at Kattankulathur, near Chennai.</span></li>
      <li><b>2002</b><span>SRM Institute of Science and Technology, Chennai, receives deemed-to-be-university status under Section 3 of the UGC Act, 1956. SRM Dental College, Ramapuram, is included.</span></li>
      <li><b>2003</b><span>SRM Engineering College, Kattankulathur, comes under the university.</span></li>
      <li><b>2010</b><span>The Inter Disciplinary School of Indian System of Medicine is set up.</span></li>
      <li><b>2013</b><span>The university launches its campus in Haryana.</span></li>
      <li><b>2024</b><span>NAAC accredits SRMIST with its highest grade, A++.</span></li>
    </ol>
  </section>

  <section class="section wrap" id="faculties" aria-labelledby="fac-title">
{shead("Six faculties.", "Programmes are organised into six faculties, from engineering and medicine to law and agriculture.", ("academics.html#areas", "All areas of study"), "fac-title")}
    <ul class="index">{fl}</ul>
  </section>

  <section class="section wrap" id="campuses" aria-labelledby="camp-title">
{shead("Campuses.", "SRMIST teaches at Kattankulathur and at campuses across India.", ("campus-life.html", "Campus life"), "camp-title")}
    <ul class="index index--text">{cl}</ul>
  </section>"""
page("page.html", "About", "About SRM Institute of Science and Technology: who we are, vision and mission, core values, history, faculties and campuses.", abt)

# ---------- shared chrome on the existing pages
for f, act in (("index.html", None), ("page.html", "page.html")):
    wr(f, apply_chrome(rd(f), act))
print("built", [n for n, _ in NAV])

