with open('assets/skyline.svg', 'r', encoding='utf-8') as f:
    skyline_svg = f.read()

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="SRM Institute of Science and Technology (SRMIST), Kattankulathur. A premier multi-disciplinary research institution in Chennai, India.">
  <title>SRM Institute of Science and Technology | Kattankulathur</title>
  
  <link rel="stylesheet" href="/styles/tokens.css">
  <link rel="stylesheet" href="/styles/base.css">
  <link rel="stylesheet" href="/styles/components.css">
  <link rel="icon" type="image/svg+xml" href="/assets/img/srm-logo.svg">
</head>
<body>
  <!-- Accessible Skip Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- 1. Header & Navigation -->
  <header class="site-header" role="banner">
    <div class="container header-inner">
      <a href="/" class="brand-link" aria-label="SRM Institute of Science and Technology Homepage">
        <img src="/assets/img/srm-logo.svg" alt="SRM Institute of Science and Technology Logo" class="brand-logo-img" width="140" height="40">
        <span class="brand-campus-tag">Kattankulathur<br>Main Campus</span>
      </a>

      <nav class="site-nav" aria-label="Main Navigation">
        <a href="/academics.html" class="nav-link">Academics</a>
        <a href="#ways-in" class="nav-link">Admissions</a>
        <a href="#statement-research" class="nav-link">Research</a>
        <a href="#statement-life" class="nav-link">Campus Life</a>
        <a href="#milestones" class="nav-link">About</a>
      </nav>

      <div class="header-actions">
        <a href="#ways-in" class="btn btn-secondary" style="min-height: 40px; padding: 0 16px; font-size: 13px;">Apply 2027</a>
        <a href="/menu.html" class="menu-circle-btn" aria-label="Open full site navigation directory">
          <span></span>
          <span></span>
          <span></span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content Landmark -->
  <main id="main-content">
    
    <!-- 2. Hero Section (VCUarts Inspired Identity) -->
    <section class="hero-section" aria-label="SRM Introduction">
      <div class="container hero-content">
        
        <!-- Giant Photo-Clipped Wordmark -->
        <div class="hero-wordmark-container">
          <h1 class="hero-wordmark" aria-label="SRM">srm</h1>
        </div>

        <!-- Editorial Intro Sentence & Proof Point -->
        <div class="hero-editorial-group">
          <p class="hero-intro-text">
            A premier multi-disciplinary research institution in Kattankulathur, cultivating 52,000+ engineers, scientists, physicians, and creators since 1985.
          </p>

          <div class="hero-subproof">
            <span class="hero-subproof-badge">Ranked #12</span>
            <span class="hero-subproof-item">NIRF Indian Universities <span class="todo-verify">TODO: verify</span></span>
            <span class="hero-subproof-item">NAAC A++ Grade <span class="todo-verify">TODO: verify</span></span>
            <span class="hero-subproof-item">UGC Category I Autonomy</span>
          </div>

          <!-- Three Pill CTAs with clear hierarchy (Rams/D lever 1) -->
          <div class="hero-cta-group">
            <a href="#ways-in" class="btn btn-primary">Apply for 2027</a>
            <a href="/academics.html" class="btn btn-secondary">Explore programmes</a>
            <a href="#ways-in" class="btn btn-secondary">Schedule a visit</a>
          </div>
        </div>

      </div>
    </section>

    <!-- 3. Statement Bands (UT Austin Resting State: 3 Stacked Full-Bleed Photo Bands) -->
    <section class="statement-bands-section" aria-label="Institutional Pillars">
      
      <!-- Band 1: Learn -->
      <article class="statement-band band-learn" id="statement-learn">
        <div class="container band-content">
          <div class="band-theme-tag">01 &middot; Academic Rigour</div>
          <h2 class="band-headline">Engineering the Next Scale</h2>
          <p class="band-sentence">
            Purpose-built computational facilities, including dedicated Apple iMac design laboratories and high-performance computing clusters, ground foundational theory into live engineering practice from day one.
          </p>
          <div class="band-meta-row">
            <div class="band-stat-line">
              <span class="band-stat-highlight">980+</span> Placement Partners &middot; <span class="band-stat-highlight">&#8377;52 LPA</span> Highest Package <span class="todo-verify">TODO: verify</span>
            </div>
            <a href="/academics.html" class="band-link-cta">Explore undergraduate programmes &rarr;</a>
          </div>
        </div>
      </article>

      <!-- Band 2: Research -->
      <article class="statement-band band-research" id="statement-research">
        <div class="container band-content">
          <div class="band-theme-tag">02 &middot; Applied Discovery</div>
          <h2 class="band-headline">Discovery at Molecular Precision</h2>
          <p class="band-sentence">
            From targeted nanomedicine synthesis to next-generation battery electrolytes, over 47,000 peer-reviewed investigations emerge directly from active faculty laboratories and undergraduate research fellowships.
          </p>
          <div class="band-meta-row">
            <div class="band-stat-line">
              <span class="band-stat-highlight">920+</span> Patents Granted &middot; <span class="band-stat-highlight">#2</span> in Nature Index Among Private Universities <span class="todo-verify">TODO: verify</span>
            </div>
            <a href="/academics.html#research" class="band-link-cta">Examine research centres &rarr;</a>
          </div>
        </div>
      </article>

      <!-- Band 3: Life on Campus -->
      <article class="statement-band band-life" id="statement-life">
        <div class="container band-content">
          <div class="band-theme-tag">03 &middot; Living Community</div>
          <h2 class="band-headline">A 250-Acre Connected Biosphere</h2>
          <p class="band-sentence">
            A self-contained residential ecosystem in Kattankulathur featuring lakeside housing, Olympic-grade sports complexes, central libraries, and over 60 active student-run technical societies.
          </p>
          <div class="band-meta-row">
            <div class="band-stat-line">
              <span class="band-stat-highlight">52,000+</span> Scholars &middot; <span class="band-stat-highlight">60+</span> International Nationalities Represented <span class="todo-verify">TODO: verify</span>
            </div>
            <a href="#ways-in" class="band-link-cta">Plan a campus visit &rarr;</a>
          </div>
        </div>
      </article>

    </section>

    <!-- 4. Ways In (Oregon Outdoor Alliance: 01 / 02 / 03 Numbered Blocks) -->
    <section class="ways-in-section" id="ways-in" aria-label="Primary Pathways">
      <div class="container">
        <div class="section-header-block">
          <span class="section-label">Ways In</span>
          <h2 class="section-title">Your pathway into SRMIST Kattankulathur</h2>
        </div>

        <div class="ways-in-grid">
          <!-- 01: Apply -->
          <div class="way-block">
            <div class="way-top">
              <span class="ways-in-num">01</span>
              <h3 class="way-title">Apply for Admission</h3>
              <p class="way-desc">
                Centralised entrance examinations (SRMJEEE) and transparent merit criteria across engineering, medical, humanities, law, and management streams.
              </p>
            </div>
            <a href="https://admissions.srmist.edu.in" class="way-link external" target="_blank" rel="noopener">
              Admissions Portal 2027
            </a>
          </div>

          <!-- 02: Explore Programs -->
          <div class="way-block">
            <div class="way-top">
              <span class="ways-in-num">02</span>
              <h3 class="way-title">Explore 240+ Programmes</h3>
              <p class="way-desc">
                Interdisciplinary undergraduate and graduate curricula benchmarked with ABET and global engineering boards, including industry-integrated options.
              </p>
            </div>
            <a href="/academics.html" class="way-link">
              View Programme Catalogue &rarr;
            </a>
          </div>

          <!-- 03: Visit Campus -->
          <div class="way-block">
            <div class="way-top">
              <span class="ways-in-num">03</span>
              <h3 class="way-title">Visit Kattankulathur</h3>
              <p class="way-desc">
                Walk through the iconic Tech Park towers, experience live computing clusters, tour the residential hostels, and meet faculty advisors in person.
              </p>
            </div>
            <a href="https://www.srmist.edu.in/about-us/campus-tour/" class="way-link external" target="_blank" rel="noopener">
              Schedule Campus Tour
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Work from SRM (RISD-Style Editorial Cards with Image Credits) -->
    <section class="work-section" aria-label="Selected Work & Innovation">
      <div class="container">
        <div class="section-header-block">
          <span class="section-label">Work & Discovery</span>
          <h2 class="section-title">Engineered on campus</h2>
        </div>

        <div class="work-grid">
          
          <!-- Card 1: Technoblizz -->
          <article class="work-card">
            <div class="work-media-container">
              <img src="/assets/img/work-technoblizz.webp" alt="Undergraduate engineering exhibition TECHNOBLIZZ" width="600" height="375">
            </div>
            <div class="work-meta-row">
              <span>Robotics & IoT</span>
              <span>Oct 2026</span>
            </div>
            <h3 class="work-title">TECHNOBLIZZ Open-House</h3>
            <p class="work-summary">
              Over 140 working prototypes demonstrated directly to industry partners, spanning agricultural automation, autonomous navigation, and medical instrumentation.
            </p>
            <div class="image-credit-line">Credit: SRM Media Cell &middot; KTR Campus</div>
          </article>

          <!-- Card 2: Drones -->
          <article class="work-card">
            <div class="work-media-container">
              <img src="/assets/img/work-drones.webp" alt="Aerospace engineering student assembling an autonomous UAV" width="600" height="400">
            </div>
            <div class="work-meta-row">
              <span>Aerospace Systems</span>
              <span>Sep 2026</span>
            </div>
            <h3 class="work-title">Autonomous Drone Telemetry</h3>
            <p class="work-summary">
              Aerospace engineering cohorts fabricating multi-rotor carbon UAVs calibrated for coastal ecological survey and low-altitude sensor telemetry.
            </p>
            <div class="image-credit-line">Credit: School of Mechanical & Aerospace Engineering</div>
          </article>

          <!-- Card 3: Volvo Centre -->
          <article class="work-card">
            <div class="work-media-container">
              <img src="/assets/img/work-volvo-centre.webp" alt="Volvo Group and SRMIST Vehicle Technology Centre partnership" width="600" height="337">
            </div>
            <div class="work-meta-row">
              <span>Industry Co-Innovation</span>
              <span>Oct 2026</span>
            </div>
            <h3 class="work-title">Volvo Vehicle Technology Centre</h3>
            <p class="work-summary">
              Joint corporate R&D centre accelerating heavy-duty electric commercial vehicle powertrain calibration, embedded firmware, and direct student apprenticeships.
            </p>
            <div class="image-credit-line">Credit: SRM Directorate of Corporate Relations</div>
          </article>

          <!-- Card 4: Nanotechnology -->
          <article class="work-card">
            <div class="work-media-container">
              <img src="/assets/img/research-nanotech.webp" alt="Nanotechnology Research Center cleanroom equipment" width="500" height="333">
            </div>
            <div class="work-meta-row">
              <span>Nanomaterials</span>
              <span>Ongoing</span>
            </div>
            <h3 class="work-title">Nanotechnology Cleanrooms (NRC)</h3>
            <p class="work-summary">
              Class 100/1000 cleanroom synthesis of nano-photonic substrates, thin-film transistor arrays, and biocompatible targeted drug delivery micro-capsules.
            </p>
            <div class="image-credit-line">Credit: Nanotechnology Research Center &middot; SRMIST</div>
          </article>

        </div>
      </div>
    </section>

    <!-- 6. Milestones & Pull-Quote (Harvard Style) -->
    <section class="milestones-section" id="milestones" aria-label="Institutional Milestones">
      <div class="container">
        <div class="section-header-block">
          <span class="section-label">Institutional Arc</span>
          <h2 class="section-title">Four decades of academic momentum</h2>
        </div>

        <div class="milestones-layout">
          <!-- Left: Simple Dated Timeline -->
          <ol class="timeline-list">
            <li class="timeline-item">
              <div class="timeline-year">1985</div>
              <p class="timeline-text">
                Established as SRM Engineering College under the University of Madras with seven foundational departments.
              </p>
            </li>
            <li class="timeline-item">
              <div class="timeline-year">2002</div>
              <p class="timeline-text">
                Conferred Deemed University status by the UGC and Ministry of Human Resource Development, Government of India.
              </p>
            </li>
            <li class="timeline-item">
              <div class="timeline-year">2018</div>
              <p class="timeline-text">
                Accredited with highest grade <strong>NAAC A++</strong> (3.55/4.0 CGPA) <span class="todo-verify">TODO: verify</span>, granting autonomous status under UGC Category I.
              </p>
            </li>
            <li class="timeline-item">
              <div class="timeline-year">2024</div>
              <p class="timeline-text">
                Secured <strong>Rank #12</strong> among all universities in India in the National Institutional Ranking Framework (NIRF) <span class="todo-verify">TODO: verify</span>.
              </p>
            </li>
            <li class="timeline-item">
              <div class="timeline-year">2026</div>
              <p class="timeline-text">
                Commissioned ₹3-Crore dedicated Apple iMac computing laboratories and the Volvo Heavy Vehicle Co-Innovation facility <span class="todo-verify">TODO: verify</span>.
              </p>
            </li>
          </ol>

          <!-- Right: Pull-Quote Block (Harvard Style) -->
          <div class="pull-quote-block">
            <blockquote class="quote-text">
              &ldquo;The true measure of an institution is not merely the citations it amasses, but whether the engineering conceived within its halls resolves the immediate realities of our society.&rdquo;
            </blockquote>
            <cite class="quote-cite">&mdash; Dr. T. R. Paarivendhar, Founder Chancellor</cite>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Quiet Partners Wall -->
    <section class="partners-section" aria-label="Academic and Industry Partners">
      <div class="container">
        <div class="partners-heading">Academic &amp; Industrial Research Alliances</div>
        <div class="partners-grid">
          <div class="partner-item">Volvo Group</div>
          <div class="partner-item">Philips Healthcare</div>
          <div class="partner-item">MIT Media Lab Alliance</div>
          <div class="partner-item">UC Davis</div>
          <div class="partner-item">Columbia University</div>
          <div class="partner-item">Harvard Kennedy School</div>
          <div class="partner-item">SUNY Binghamton</div>
        </div>
      </div>
    </section>

  </main>

  <!-- 8. Footer & The Illustrated TP + TP2 Skyline (The Second Showpiece) -->
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      
      <!-- Footer Nav Grid -->
      <div class="footer-nav-grid">
        <div class="footer-col footer-col-brand">
          <img src="/assets/img/srm-logo-white.svg" alt="SRM IST White Logo" class="footer-brand-logo" width="140" height="40">
          <address class="footer-brand-address">
            SRM Institute of Science and Technology<br>
            SRM Nagar, Kattankulathur - 603 203<br>
            Chengalpattu District, Tamil Nadu, India.<br>
            <span style="display: block; margin-top: 8px;">Admissions Enquiry: +91 44 2745 5510</span>
          </address>
        </div>

        <div class="footer-col">
          <h4>Academics</h4>
          <ul class="footer-link-list">
            <li><a href="/academics.html">School of Computing</a></li>
            <li><a href="/academics.html">School of Architecture</a></li>
            <li><a href="/academics.html">Mechanical &amp; Aerospace</a></li>
            <li><a href="/academics.html">Medical &amp; Health Sciences</a></li>
            <li><a href="/academics.html">Management &amp; Law</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Campuses</h4>
          <ul class="footer-link-list">
            <li><a href="/">Kattankulathur (Main)</a></li>
            <li><a href="https://www.srmrmp.edu.in/" class="external" target="_blank" rel="noopener">Ramapuram</a></li>
            <li><a href="https://vdp.srmist.edu.in/" class="external" target="_blank" rel="noopener">Vadapalani</a></li>
            <li><a href="https://www.srmup.in/" class="external" target="_blank" rel="noopener">NCR Delhi (Modinagar)</a></li>
            <li><a href="https://srmtrichy.edu.in/" class="external" target="_blank" rel="noopener">Tiruchirappalli</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Audience</h4>
          <ul class="footer-link-list">
            <li><a href="#ways-in">Prospective Students</a></li>
            <li><a href="https://evarsity.srmist.edu.in" class="external" target="_blank" rel="noopener">Student Portal (eVarsity)</a></li>
            <li><a href="https://alumni.srmist.edu.in" class="external" target="_blank" rel="noopener">Alumni Network</a></li>
            <li><a href="#statement-research">Corporate Recruiters</a></li>
            <li><a href="/menu.html">Site Directory</a></li>
          </ul>
        </div>
      </div>

      <!-- Compliance & Mandatory Disclosures (Preserved as identified in audit) -->
      <div class="footer-compliance-row">
        <div>&copy; 2026 SRM Institute of Science and Technology. All rights reserved.</div>
        <div class="compliance-links">
          <a href="https://www.srmist.edu.in/naac-ssr/" class="external" target="_blank" rel="noopener">NAAC SSR</a>
          <a href="https://www.srmist.edu.in/nirf/" class="external" target="_blank" rel="noopener">NIRF</a>
          <a href="https://www.srmist.edu.in/aicte/" class="external" target="_blank" rel="noopener">AICTE Approvals</a>
          <a href="https://www.srmist.edu.in/rti/" class="external" target="_blank" rel="noopener">RTI</a>
          <a href="https://www.srmist.edu.in/mandatory-disclosure/" class="external" target="_blank" rel="noopener">Mandatory Disclosure</a>
        </div>
      </div>

    </div>

    <!-- The TP & TP2 Illustrated Skyline (Second Showpiece at Very Bottom) -->
    <div class="footer-skyline-wrapper" aria-hidden="true">
{skyline_svg}
    </div>
  </footer>

</body>
</html>
'''

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Re-generated index.html with fixes!")
