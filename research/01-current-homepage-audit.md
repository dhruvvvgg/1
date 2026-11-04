# srmist.edu.in homepage review

Source: a saved copy of the live homepage taken on 4 Nov 2026 ("Page Updated: Nov 4th, 2026"). The site blocks automated browsers, so this review covers the structure, content and code. It does not cover the visual layout. The counters show "0" in the saved file because the JavaScript that animates them didn't run. That isn't a bug on the live site.

## Snapshot

| Metric | Value |
|---|---|
| Stack | WordPress 7.1 + Elementor (8,000+ Elementor references), jQuery, Swiper and Slick (two slider libraries), AIOSEO |
| Script tags / stylesheets | 68 / 55 |
| Images | 111, of which **72 have no alt text** |
| Headings | **0 × h1**, 47 × h2, 59 × h3, 18 × h4 |
| Homepage sections | ~22 content sections + 2 footers |
| Brand colours in use | gold `#e4b316`, blue `#0C4DA2`, green `#39b54a`, greys |
| Fonts | Butler (serif) and Source Sans Pro, plus Elementor global fonts |

## What's good (keep these)

1. **Navigation by audience.** The top bar links Students, Faculty & Staff, Parents, Visitors, Alumni and Examinations. That's the right mental model for a university.
2. **Campus switcher.** All six campuses are one click away.
3. **Strong proof material.** The page has NIRF ranks, NAAC A++, QS, 980+ recruiters, 5,546+ offers, a 52 LPA highest CTC, 920+ patents, 47,000+ publications, Nature Index #2 among private universities, and sports medal counts. Few competitors have this much to show. The problem is how it's presented, not the content.
4. **Programme Finder** lets visitors search by level, degree or discipline, which is the most useful tool for prospective students.
5. **News and Events have dates and are current.** Recent examples are the 22nd Convocation, the Apple Swift Student Challenge winner, Formula Bharat and TECHNOBLIZZ.
6. **Strong names for social proof.** Alumni include Sriram Krishnan (White House AI policy) and Varun Chakravarthy. The "Legacy" section lists the ISRO, DRDO and NITI Aayog leaders.
7. **Compliance links are complete.** UGC, AICTE, NAAC SSR, RTI, mandatory disclosures and regulatory approvals are all linked. These are required by law, so the redesign has to keep them (but can move them lower).
8. **There's a 360° virtual tour and an accessibility toolbar.**

## What's not working

### P0: trust and credibility
- **Stale content in Nov 2026:**
  - "Placement Highlights **2023-2024**"
  - "NIRF Rankings **2024**"
  - "Sports Achievements **2023-2024**"
  - "MD/MS Admission Announcement **2024-2025**"
  - "Super Specialty Admissions **2025**"
  - BMR 2026 (25-28 Oct) still listed under *upcoming* events

  Outdated numbers on the front page make every other number look unreliable.
- **Five different admission cycles appear at once:** 2024-25, 2025, 2026, 2026-27 and 2027. A prospective student can't tell which one applies to them.
- **Typos and errors:**
  - "Housing & Residen**tal**"
  - "programs **s**" in the meta description
  - "**Pro.** Ashutosh Sharma"
  - "Faculty & Staff**s**"
  - The h2 heading for the admissions phone line is a 20-word sentence.

### P0: no clear main job for the page
- **No `<h1>`**. The hero line "Learn. Leap. Lead." is an h2, and its supporting line ("A Place for Learning, Discovery, Innovation, Expression and Discourse") is generic. The hero never says what SRM is or who it's for.
- **The calls to action are scattered.** There are about 7 "Apply / Apply Now" links, plus "Admission Enquiry", plus 4 "Admissions" entries in the nav. "Explore SRM" appears twice. Nothing is designed as *the* main action.
- **The page is ~22 sections long**, and the order follows the org chart rather than the visitor. Ranking numbers appear 3 times (NIRF strip, "Accreditations & Rankings", the "Rankings & Accreditations" carousel). "International Students" appears twice. The colleges list appears 3+ times.

### P1: information architecture
- **The mega-menus are huge.** Research alone has 40+ links, including unexplained acronyms (SERI, IIISM, REACH, NRC, CACR, HPCC, SCIF, DPRC, RDC). Some items repeat inside the same menu (MoUs and Patents appear twice).
- **There are two full footers**, and they repeat each other: Colleges, A-Z Quicklinks, Insights, Admissions & Aid, Media and Visitors each appear twice.
- **The menus differ between desktop and mobile.** Desktop Research says "Funded Research → SERI…" and mobile says "Student Research". The labels don't match.
- **The admissions phone numbers split programmes in a confusing way**: Engineering+Agri+Arch on one number, and everything else, including Medical and Law, on another.

### P1: performance and code quality
- 68 scripts, 55 stylesheets and two slider libraries (Swiper + Slick) on one page. Elementor pages this heavy usually fail Core Web Vitals on mobile, especially on Indian 4G connections, where most applicants will be browsing. *(I couldn't measure this, so run Lighthouse in a real browser to confirm.)*
- The nav markup is duplicated 2-3× (desktop, mobile and sticky versions), so the page is far bigger than it needs to be.

### P1: accessibility
- 72 of 111 images have no alt text, there's no h1, and the heading levels skip around.
- The accessibility toolbar is an overlay ("Grayscale", "Negative Contrast"). Overlays don't fix the underlying problems. Judges who know the field will see the toolbar as a band-aid, so build accessibility into the redesign itself.
- Slider arrows labelled only "Previous / Next" give no context to people using screen readers.

### P2: visual identity (inferred from the code; check against screenshots)
- Gold, blue and green all compete as accent colours, the Elementor global fonts are mixed with Butler and Source Sans, and there are about 100 inline style attributes. Each section was styled on its own, so there's no consistent design system.
- The poster uses a blue-and-orange tech look, which doesn't match either the site's gold or its blue. Decide on one brand direction.

## What the redesign should take from this

1. **One clear hero.** Say plainly what SRM is, show a current proof point (e.g. "NIRF #12 University · NAAC A++"), and give one main action ("Find your programme") and one secondary action ("Apply 2027").
2. **Choose one admissions cycle** and show it everywhere, with an automatic date-driven banner for the current cycle.
3. **Merge the proof sections** (rankings, placements, research, sports) into a single "SRM in numbers" band, with the year on every number and the numbers drawn from one data source so they can't go out of date.
4. **Organise the page by audience**: Prospective → Current students → Researchers/industry → Alumni. Move the compliance links into one tidy footer.
5. **Make the mega-menus smaller.** Show around 8 links per column, spell out the acronyms, and put everything else on the section's landing page.
6. **Show the page is fast and accessible**: one h1, alt text throughout, a single slider library or none at all, and a Lighthouse before/after comparison to present to the judges.

## Still to do
- Get desktop and mobile screenshots to review the visual layout: hero imagery, density, colour and spacing.
- Run Lighthouse on the live page in a real browser to get performance and accessibility numbers for the before/after comparison.
