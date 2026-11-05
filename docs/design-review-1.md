# Design review 1

**Verdict:** Solid as a static layout study after corrections. Official imagery and verified editorial content are still required before competition submission.

**Top issues (max 5):**
1. External-link glyph rendered as a missing character in Manrope; visitors could not distinguish outbound links reliably.
2. Mobile university identification disappeared with the desktop header descriptor; the first screen did not state the full institution name visibly.
3. Mobile CTAs wrapped into an accidental two-plus-one arrangement; the primary action lacked a clear position.
4. Hero wordmark left too much unused width; the intended visual signature was weaker than the photo bands.
5. Two editorial illustrations were identical; they made distinct story slots appear duplicated.

**Changes made:**
- Missing font glyph → consistent 12×12px inline SVG ↗ mark, 1.5px stroke, currentColor. Decorative mark hidden from assistive technology; link text carries its purpose.
- Generic hero topline → visible full university name plus Kattankulathur location, retained at 390px.
- Wrapping flex CTAs → two-column mobile grid, Apply spans both columns. All pills remain at least 48px tall.
- Wordmark 31vw (30vw mobile), 36rem cap → 40vw, 44rem cap. The same letter treatment works at all four widths.
- Duplicate studio placeholder → separate triangle/circle worktable composition. All captions continue to identify illustrations as placeholders.

**Not verified:**
- At least six official campus/people photographs, official logo, and TP/TP2 exterior reference photos: unavailable under current proxy policy (CONNECT 403). No low-quality or stock substitute was used. See assets/CREDITS.md.
- Exact SRM accent color, institutional dates, current programme/research/campus facts, accreditation, partner identities/permissions, real projects and external destination behavior. See verification-inventory.md.
- Safari, Firefox, physical mobile devices, screen-reader usability and measured production Core Web Vitals. Automated axe checks do not establish complete accessibility compliance.

## Four design tests after fixes

- Squint: the SRM letterforms lead the first viewport; solid Apply leads the action group. Quiet cards and timeline do not introduce another competing accent.
- Three seconds: visible institution name, campus location, broad study areas and Apply answer who, where and next step. Illustrations clearly identify the asset gap.
- Subtraction: removed the generic hero tagline rather than adding another label. No decorative statistics, arbitrary counters or ornamental badges.
- Phone-call: “SRM letters filled with a campus image slot; a short introduction and Apply; three full-width learning/research/life chapters; ways in, work, history, partners, illustrated towers.”

## Visual-craft check

Flat colors, no gradients or glow; two self-hosted type families; consistent 8px-led spacing; pill actions; 8px image corners; borders for structure and no card shadows; isolated photo-band layers with a documented z-scale; no pure black/white surfaces. No runtime JavaScript or animation. Only named transform/opacity feedback (160ms), disabled under reduced motion. Visible focus, native semantic landmarks, one h1 per page, skip link, alt text, and native footer disclosure controls.

## Two-pass evidence

Captured full-page screenshots of all three pages at 390, 768, 1280 and 1920px wide, viewport height 1000px. Reviewed full-page captures and width comparison sheets, plus enlarged hero crops. First pass: screenshots/pass-1. Corrected all five listed issues. Rebuilt and captured second pass: screenshots/pass-2. Each directory includes the automated results JSON from that run.

Both passes: 12/12 page/width checks passed; no horizontal overflow, broken images, broken same-page anchor targets, JavaScript errors, local HTTP errors, or axe WCAG 2 A/AA and 2.1 AA violations. Each page has one h1 and no production script tags. At all four widths, keyboard skip-link activation, menu → Academics navigation, and footer accordion close/reopen checks passed. Both skyline buildings stay in the viewBox and remain visible on mobile. Second review found no additional layout issues.
