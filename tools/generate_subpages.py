with open('assets/skyline.svg', 'r', encoding='utf-8') as f:
    skyline_svg = f.read()

academics_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Explore Academic Schools and Programmes at SRM Institute of Science and Technology, Kattankulathur.">
  <title>Academics &amp; Schools | SRMIST Kattankulathur</title>
  
  <link rel="stylesheet" href="/styles/tokens.css">
  <link rel="stylesheet" href="/styles/base.css">
  <link rel="stylesheet" href="/styles/components.css">
  <link rel="icon" type="image/svg+xml" href="/assets/img/srm-logo.svg">
  <style>
    .page-hero {{
      padding-top: var(--space-8);
      padding-bottom: var(--space-7);
      background-color: var(--color-bg);
      border-bottom: 1px solid var(--color-border);
    }}
    .breadcrumbs {{
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-ink-subtle);
      margin-bottom: var(--space-3);
    }}
    .page-title {{
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 900;
      letter-spacing: -0.04em;
      color: var(--color-ink);
      margin-bottom: var(--space-4);
    }}
    .page-lede {{
      font-family: var(--font-serif);
      font-size: clamp(1.15rem, 2vw, 1.45rem);
      color: var(--color-ink-muted);
      max-width: 68ch;
      line-height: var(--leading-editorial);
    }}
    .filter-bar {{
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--color-border);
    }}
    .filter-pill {{
      display: inline-flex;
      align-items: center;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-pill);
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: var(--color-ink);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      text-decoration: none;
      cursor: pointer;
    }}
    .filter-pill.active {{
      background-color: var(--color-ink);
      color: #FFFFFF;
      border-color: var(--color-ink);
    }}
    .schools-section {{
      padding-top: var(--space-8);
      padding-bottom: var(--space-9);
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }}
    .schools-grid {{
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }}
    @media (min-width: 768px) {{
      .schools-grid {{
        grid-template-columns: repeat(2, 1fr);
      }}
    }}
    @media (min-width: 1024px) {{
      .schools-grid {{
        grid-template-columns: repeat(3, 1fr);
      }}
    }}
    .school-card {{
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-5);
      transition: border-color 150ms ease;
    }}
    .school-card:hover {{
      border-color: var(--color-ink);
    }}
    .school-tag {{
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--color-accent);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .school-name {{
      font-size: var(--font-size-lg);
      font-weight: 800;
      color: var(--color-ink);
      margin-top: var(--space-2);
      margin-bottom: var(--space-2);
    }}
    .school-desc {{
      font-size: var(--font-size-sm);
      color: var(--color-ink-muted);
      line-height: 1.55;
    }}
    .school-stats-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
      font-size: var(--font-size-xs);
      color: var(--color-ink-subtle);
      font-weight: 600;
    }}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Header -->
  <header class="site-header" role="banner">
    <div class="container header-inner">
      <a href="/" class="brand-link" aria-label="SRM Institute of Science and Technology Homepage">
        <img src="/assets/img/srm-logo.svg" alt="SRM Logo" class="brand-logo-img" width="140" height="40">
        <span class="brand-campus-tag">Kattankulathur<br>Main Campus</span>
      </a>

      <nav class="site-nav" aria-label="Main Navigation">
        <a href="/academics.html" class="nav-link active">Academics</a>
        <a href="/#ways-in" class="nav-link">Admissions</a>
        <a href="/#statement-research" class="nav-link">Research</a>
        <a href="/#statement-life" class="nav-link">Campus Life</a>
        <a href="/#milestones" class="nav-link">About</a>
      </nav>

      <div class="header-actions">
        <a href="/#ways-in" class="btn btn-secondary" style="min-height: 40px; padding: 0 16px; font-size: 13px;">Apply 2027</a>
        <a href="/menu.html" class="menu-circle-btn" aria-label="Open full site navigation directory">
          <span></span>
          <span></span>
          <span></span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main id="main-content">
    
    <!-- Hero Header -->
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs">
          <a href="/">Home</a> &nbsp;/&nbsp; <span>Academics</span>
        </div>
        <h1 class="page-title">Schools &amp; Programmes</h1>
        <p class="page-lede">
          Six multidisciplinary faculties spanning 240+ degree programmes, anchored on flexible choice-based credit systems, experiential lab immersion, and international ABET accreditation.
        </p>

        <!-- Static Filter Bar -->
        <div class="filter-bar" role="tablist" aria-label="Programme Level Filter">
          <button class="filter-pill active" role="tab" aria-selected="true">All Faculties (6)</button>
          <button class="filter-pill" role="tab" aria-selected="false">Engineering &amp; Technology</button>
          <button class="filter-pill" role="tab" aria-selected="false">Architecture &amp; Design</button>
          <button class="filter-pill" role="tab" aria-selected="false">Medicine &amp; Health Sciences</button>
          <button class="filter-pill" role="tab" aria-selected="false">Science &amp; Humanities</button>
          <button class="filter-pill" role="tab" aria-selected="false">Management &amp; Law</button>
        </div>
      </div>
    </section>

    <!-- Schools Grid -->
    <section class="schools-section" aria-label="Faculties and Academic Schools">
      <div class="container">
        <div class="schools-grid">
          
          <!-- School 1 -->
          <article class="school-card">
            <div>
              <span class="school-tag">Computing Hub &middot; Tech Park</span>
              <h2 class="school-name">School of Computing</h2>
              <p class="school-desc">
                Housed across the 15-storey Tech Park complex. Specialisations in Distributed Systems, Artificial Intelligence, Cybersecurity, Cloud Infrastructure, and Data Engineering.
              </p>
            </div>
            <div class="school-stats-row">
              <span>B.Tech / M.Tech / Ph.D</span>
              <span class="todo-verify">ABET Accredited</span>
            </div>
          </article>

          <!-- School 2 -->
          <article class="school-card">
            <div>
              <span class="school-tag">Engineering Block &middot; Main Campus</span>
              <h2 class="school-name">School of Mechanical &amp; Aerospace</h2>
              <p class="school-desc">
                Pioneering automotive powertrain engineering, composite aerodynamic materials, satellite subsystems, and industrial robotics laboratories in collaboration with global partners.
              </p>
            </div>
            <div class="school-stats-row">
              <span>B.Tech / M.Tech</span>
              <span class="todo-verify">Volvo Tech Centre</span>
            </div>
          </article>

          <!-- School 3 -->
          <article class="school-card">
            <div>
              <span class="school-tag">Design Studios &middot; Architecture Complex</span>
              <h2 class="school-name">School of Architecture &amp; Interior Design</h2>
              <p class="school-desc">
                Council of Architecture approved curricula emphasizing climate-responsive urban design, parametric building modelling, and sustainable tropical habitat planning.
              </p>
            </div>
            <div class="school-stats-row">
              <span>B.Arch / B.Des / M.Arch</span>
              <span class="todo-verify">CoA Approved</span>
            </div>
          </article>

          <!-- School 4 -->
          <article class="school-card">
            <div>
              <span class="school-tag">Bio-Engineering Labs &middot; UB Campus</span>
              <h2 class="school-name">School of Bioengineering</h2>
              <p class="school-desc">
                Cross-disciplinary integration of molecular genetics, biomedical instrumentation, tissue engineering, and computational biology alongside active clinicians.
              </p>
            </div>
            <div class="school-stats-row">
              <span>B.Tech / M.Tech / Ph.D</span>
              <span class="todo-verify">DST-FIST Supported</span>
            </div>
          </article>

          <!-- School 5 -->
          <article class="school-card">
            <div>
              <span class="school-tag">Medical College &amp; Hospital &middot; KTR</span>
              <h2 class="school-name">Faculty of Medical &amp; Health Sciences</h2>
              <p class="school-desc">
                Tertiary 1,200-bed teaching hospital facility providing clinical education across MBBS, MD/MS super-specialties, nursing, pharmacy, and physiotherapy.
              </p>
            </div>
            <div class="school-stats-row">
              <span>MBBS / MD / MS</span>
              <span class="todo-verify">NMC Approved</span>
            </div>
          </article>

          <!-- School 6 -->
          <article class="school-card">
            <div>
              <span class="school-tag">Management Tower &middot; Main Campus</span>
              <h2 class="school-name">School of Management &amp; Law</h2>
              <p class="school-desc">
                Developing corporate leadership and jurisprudence through case-method pedagogies, financial trading simulators, and constitutional moot court training.
              </p>
            </div>
            <div class="school-stats-row">
              <span>BBA / MBA / B.A. LL.B</span>
              <span class="todo-verify">BCI / AICTE</span>
            </div>
          </article>

        </div>
      </div>
    </section>

  </main>

  <!-- Footer with TP + TP2 Skyline -->
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-nav-grid">
        <div class="footer-col footer-col-brand">
          <img src="/assets/img/srm-logo-white.svg" alt="SRM IST White Logo" class="footer-brand-logo" width="140" height="40">
          <address class="footer-brand-address">
            SRM Institute of Science and Technology<br>
            SRM Nagar, Kattankulathur - 603 203<br>
            Chengalpattu District, Tamil Nadu, India.
          </address>
        </div>
        <div class="footer-col">
          <h4>Academics</h4>
          <ul class="footer-link-list">
            <li><a href="/academics.html">School of Computing</a></li>
            <li><a href="/academics.html">School of Architecture</a></li>
            <li><a href="/academics.html">Mechanical &amp; Aerospace</a></li>
            <li><a href="/academics.html">Medical &amp; Health Sciences</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Campuses</h4>
          <ul class="footer-link-list">
            <li><a href="/">Kattankulathur (Main)</a></li>
            <li><a href="https://www.srmrmp.edu.in/" class="external" target="_blank" rel="noopener">Ramapuram</a></li>
            <li><a href="https://vdp.srmist.edu.in/" class="external" target="_blank" rel="noopener">Vadapalani</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Navigation</h4>
          <ul class="footer-link-list">
            <li><a href="/">Homepage</a></li>
            <li><a href="/#ways-in">Admissions Portal</a></li>
            <li><a href="/menu.html">Full Directory</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-compliance-row">
        <div>&copy; 2026 SRM Institute of Science and Technology. All rights reserved.</div>
        <div class="compliance-links">
          <a href="https://www.srmist.edu.in/naac-ssr/" class="external" target="_blank" rel="noopener">NAAC SSR</a>
          <a href="https://www.srmist.edu.in/nirf/" class="external" target="_blank" rel="noopener">NIRF</a>
          <a href="https://www.srmist.edu.in/aicte/" class="external" target="_blank" rel="noopener">AICTE</a>
        </div>
      </div>
    </div>

    <div class="footer-skyline-wrapper" aria-hidden="true">
{skyline_svg}
    </div>
  </footer>

</body>
</html>
'''

with open('academics.html', 'w', encoding='utf-8') as f:
    f.write(academics_html)

# Now create menu.html
menu_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Directory | SRMIST Kattankulathur</title>
  
  <link rel="stylesheet" href="/styles/tokens.css">
  <link rel="stylesheet" href="/styles/base.css">
  <link rel="stylesheet" href="/styles/components.css">
  <link rel="icon" type="image/svg+xml" href="/assets/img/srm-logo.svg">
  <style>
    .directory-page {{
      background-color: var(--color-dark-bg);
      color: var(--color-dark-ink);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }}
    .directory-header {{
      padding-top: var(--space-5);
      padding-bottom: var(--space-5);
      border-bottom: 1px solid var(--color-dark-border);
    }}
    .directory-close-btn {{
      width: 44px;
      height: 44px;
      border-radius: var(--radius-pill);
      background-color: var(--color-dark-surface);
      color: #FFFFFF;
      border: 1px solid var(--color-dark-border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-size: 20px;
      font-weight: 700;
    }}
    .directory-close-btn:hover {{
      background-color: var(--color-accent);
      border-color: var(--color-accent);
    }}
    .directory-content {{
      padding-top: var(--space-8);
      padding-bottom: var(--space-9);
      flex: 1;
    }}
    .directory-title {{
      font-size: clamp(2rem, 4vw, 3.5rem);
      font-weight: 900;
      color: #FFFFFF;
      margin-bottom: var(--space-6);
    }}
    .directory-grid {{
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-7);
    }}
    @media (min-width: 640px) {{
      .directory-grid {{
        grid-template-columns: repeat(2, 1fr);
      }}
    }}
    @media (min-width: 1024px) {{
      .directory-grid {{
        grid-template-columns: repeat(4, 1fr);
      }}
    }}
    .dir-group h2 {{
      font-size: var(--font-size-md);
      font-weight: 800;
      color: var(--color-accent-gold);
      margin-bottom: var(--space-4);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }}
    .dir-links {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }}
    .dir-links a {{
      font-size: var(--font-size-base);
      color: var(--color-dark-muted);
      text-decoration: none;
      transition: color 150ms ease;
    }}
    .dir-links a:hover {{
      color: #FFFFFF;
    }}
  </style>
</head>
<body class="directory-page">
  <header class="directory-header">
    <div class="container" style="display: flex; align-items: center; justify-content: space-between;">
      <a href="/" class="brand-link">
        <img src="/assets/img/srm-logo-white.svg" alt="SRM IST White Logo" class="brand-logo-img" width="140" height="40">
      </a>
      <a href="/" class="directory-close-btn" aria-label="Close directory and return to previous page">&times;</a>
    </div>
  </header>

  <main class="directory-content">
    <div class="container">
      <h1 class="directory-title">Institutional Directory</h1>

      <div class="directory-grid">
        <div class="dir-group">
          <h2>Academics</h2>
          <ul class="dir-links">
            <li><a href="/academics.html">All Schools &amp; Faculties</a></li>
            <li><a href="/academics.html">School of Computing</a></li>
            <li><a href="/academics.html">School of Architecture</a></li>
            <li><a href="/academics.html">School of Mechanical Sciences</a></li>
            <li><a href="/academics.html">Medical &amp; Health Sciences</a></li>
            <li><a href="/academics.html">Management &amp; Commerce</a></li>
            <li><a href="/academics.html">School of Law</a></li>
          </ul>
        </div>

        <div class="dir-group">
          <h2>Admissions 2027</h2>
          <ul class="dir-links">
            <li><a href="/#ways-in">Admissions Portal</a></li>
            <li><a href="https://admissions.srmist.edu.in" class="external" target="_blank" rel="noopener">SRMJEEE Registration</a></li>
            <li><a href="/#ways-in">Scholarships &amp; Fee Concessions</a></li>
            <li><a href="/#ways-in">International Admissions</a></li>
            <li><a href="/#ways-in">Campus Visit Booking</a></li>
          </ul>
        </div>

        <div class="dir-group">
          <h2>Research &amp; Centers</h2>
          <ul class="dir-links">
            <li><a href="/#statement-research">Research Overview</a></li>
            <li><a href="/#statement-research">Sir C.V. Raman Research Park</a></li>
            <li><a href="/#statement-research">Nanotechnology Research Center</a></li>
            <li><a href="/#work">Autonomous Systems &amp; UAV Lab</a></li>
            <li><a href="/#work">Volvo Vehicle Technology Centre</a></li>
          </ul>
        </div>

        <div class="dir-group">
          <h2>Campuses &amp; Portals</h2>
          <ul class="dir-links">
            <li><a href="/">Kattankulathur (Main Campus)</a></li>
            <li><a href="https://www.srmrmp.edu.in/" class="external" target="_blank" rel="noopener">Ramapuram Campus</a></li>
            <li><a href="https://vdp.srmist.edu.in/" class="external" target="_blank" rel="noopener">Vadapalani Campus</a></li>
            <li><a href="https://evarsity.srmist.edu.in" class="external" target="_blank" rel="noopener">eVarsity Student Portal</a></li>
            <li><a href="https://alumni.srmist.edu.in" class="external" target="_blank" rel="noopener">Alumni Association</a></li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
'''

with open('menu.html', 'w', encoding='utf-8') as f:
    f.write(menu_html)

print("Generated academics.html and menu.html successfully!")
