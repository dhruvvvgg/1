# SRMIST homepage redesign: design notes

This document covers the redesigned homepage at `redesign/index.html`. The current homepage, used for before/after comparison, is at `current/index.html`. The review of the current site is in `research/01-current-homepage-audit.md`.

## Principles

1. **One job per screen.** The first screen says what SRM is and gives one main action: *Find your programme*. Applying is the single secondary action, and it appears in the header, the admissions section and the closing band, always with the same label.
2. **Proof you can trust.** Every number on the page carries its year or source ("NIRF 2025", "Placements 2023–24"). Past events are removed automatically when the page loads, so the homepage can't show stale dates again.
3. **Built around the visitor, not the org chart.** The order is: prospective students (hero, admissions, colleges), then outcomes, news, research, campus life and alumni. Current students, staff and parents use the "Information for" bar at the top.
4. **The brand, refined.** SRM navy and SRM gold from the logo and the current site. The fonts are Source Serif 4 and Source Sans 3, a newer version of the Source Sans the site already uses, so the redesign feels like SRM and not a template.

## Tokens

| Role | Token | Value | Use |
|---|---|---|---|
| Brand navy | `--navy-900` | `#0B2350` | Headings, finder panel, outcomes band |
| Deep navy | `--navy-950` | `#071733` | Utility bar, footer |
| SRM blue | `--blue-700` | `#0C4DA2` | Links, secondary buttons |
| SRM gold | `--gold-500` | `#E4B316` | Main action buttons (with navy text), CTA band, accents |
| Ink | `--ink` | `#142039` | Body text (never pure black) |
| Muted | `--muted` | `#586379` | Secondary text, 5.6:1 on paper |
| Paper | `--paper` | `#F6F7FA` | Page background (never pure white) |
| Surface | `--surface` | `#FDFDFE` | Alternate sections, menus |

- **Type scale:** 13 / 15 / 17 (body) / 20 / 24–30 / 32–44 / 48–96 (display), using `clamp()` so it scales with the screen. Headings use `text-wrap: balance`, paragraphs use `text-wrap: pretty`, and all figures use tabular numbers.
- **Spacing:** 8px base (4, 8, 12, 16, 24, 32, 48, 64, 96). Gaps inside a group are always smaller than gaps between groups.
- **Radius:** 6 (controls), 10 (cards and images), 16 (panels and hero media). Nested shapes follow the outer radius = inner radius + padding rule.
- **Elevation:** hairline borders show structure. Only floating layers (menus, dialogs, the film button) get the single soft shadow token.
- **Motion:** 150–220ms, `cubic-bezier(0.2, 0, 0, 1)`, animating only transform and opacity. Buttons scale to 0.96 when pressed. Everything is disabled under `prefers-reduced-motion`.
- **Layers:** header 50, menus 60, drawer 80. Dialogs use the browser's own top layer, so no arbitrary z-index values are needed.

## What changed compared with the current homepage

| Current site | Redesign |
|---|---|
| No `<h1>`; the tagline sits in a background video | An `<h1>` plus a plain sentence saying what SRM is; the video loads only when someone asks for it |
| About 7 "Apply" links and 4 admissions entries covering 5 different cycles (2024-25 to 2027) | One cycle, **Admissions 2027**, split by applicant type into 4 accessible tabs |
| Rankings shown 3 times, "NIRF 2024" in Nov 2026 | One proof strip with **NIRF 2025** (#11 University, #14 Engineering) |
| About 22 sections, colleges listed 3+ times, two footers | 9 sections and one footer; statutory disclosures sit in a collapsible list |
| Research mega-menu with 40+ links and acronyms (SERI, IIISM, HPCC…) | At most 3 columns of 5 or fewer plain-language links per menu |
| Past events listed under "upcoming" | Each event carries its end date and is removed once it has passed |
| 68 scripts, 55 stylesheets, two slider libraries; 712 KB of HTML | 1 script (3 KB gzipped), 1 stylesheet (7 KB gzipped), 55 KB of HTML (12 KB gzipped), no dependencies |
| 72 of 111 images without alt text; an accessibility overlay | Every meaningful image has alt text and decorative ones use `alt=""`; **0 axe-core WCAG 2.1 A/AA violations** on desktop and mobile; no overlay needed |

## Accessibility and robustness

- A skip link, landmarks, one `<h1>`, and heading levels that don't skip.
- Mega menus are disclosure buttons (`aria-expanded`). They open on click, or on hover with a short delay for mouse users, and close with Escape or a click outside.
- The admissions tabs follow the WAI-ARIA tabs pattern (arrow keys, Home and End). Deep links `#international`, `#medicine` and `#phd` open the matching tab.
- The mobile drawer is generated from the desktop menu, so the two can't drift apart (they currently differ on the live site). It traps focus and closes with Escape.
- Search opens in a modal `<dialog>`, also with the `/` key.
- The campus film loads from `youtube-nocookie.com` only after someone presses play, so there's no third-party video weight on page load.
- Touch targets are at least 44px. Focus rings are visible everywhere: blue on light backgrounds, gold on dark ones.
- Images that fail to load leave a brand-tinted frame rather than a broken-image icon.
- Every link and form works without JavaScript. The programme finder submits the same `program-level` and `search-word` parameters as the live site's finder.

## Design review (self-critique)

**Verdict:** solid, with only targeted refinements needed before launch.

Applied lenses:
- **UX heuristics and cognitive load:** one main action per screen, plain-language labels, fewer decisions (4 applicant routes instead of 5 cycles), information visible rather than remembered.
- **Craft rules:** no gradients, glow or `transition: all`; tuned neutrals instead of pure black and white; a spacing scale; one elevation language; every interactive state designed.
- **Interface polish:** concentric radii, tabular numbers, `text-wrap` settings, 1px image outlines, scale-on-press, matching icon stroke (1.75px with regular-weight text), and one `currentColor` SVG set.

What's left before launch:
1. **Confirm the numbers with the university.** Placement figures are still 2023–24 because that's the latest the site publishes, and the NIRF 2025 figures should be checked on nirfindia.org. If NIRF 2026 is out, update the proof strip.
2. **Use the right photos.** The hero uses the 22nd Convocation photo. A wide campus or student photo in 4:5 (desktop) and 16:10 (mobile) crops would suit it better. Ask the communications team.
3. **Test with real users.** Run a 5-person usability test for two tasks: "find the B.Tech CSE fees" (prospective student) and "find your exam results" (current student).
4. **Measure performance.** Run Lighthouse on a deployed build. The page itself is about 22 KB gzipped plus fonts and images, but the image sizes depend on what the CMS serves.
