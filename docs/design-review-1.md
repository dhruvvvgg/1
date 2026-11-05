# Design Review 1 (Phase 1 Build)

## Verdict: Solid (Pass 2 Post-Fix Verification)

Following rigorous visual testing against the four tests (Squint, Three-Second, Subtraction, and Phone-Call) and Section A's 12 Craft Rules across 390px, 768px, 1280px, and 1920px viewports, all critical usability and visual craft issues have been resolved.

---

## Initial Top Issues Identified (Pass 1)

1. **Hero Wordmark Legibility (Squint Test Failure):**
   - *Issue:* The lowercase wordmark letters `s` and `r` blended into the off-white `#F8F9FA` background because the clipped campus photo had sky exposure on the left.
   - *Why it matters:* Hero identity is borrowed from VCUarts. If a visitor cannot read "srm" in 3 seconds, the primary identity anchor fails.

2. **Mobile Header Overlap & Wrapping:**
   - *Issue:* At 390px viewport width, the `.brand-campus-tag` text collided with the header action buttons and clipped into "KATTA MAIN C".
   - *Why it matters:* Violates mobile usability heuristics and ruins the first impression on mobile phones.

3. **Work Cards Missing Image Paint on Fast Mobile Render:**
   - *Issue:* Native `loading="lazy"` prevented the four RISD-style card images from rendering in fast full-page mobile renders.
   - *Why it matters:* Editorial proof requires immediate visual feedback with captions and credits.

4. **Footer Skyline Mobile Presence:**
   - *Issue:* At 390px wide, the 1600x420 SVG scaled down to ~95px height, diminishing the massing of the 15-storey Tech Park towers.
   - *Why it matters:* The brief requires: "Must be visible on mobile (crop/scale so both buildings stay in frame). Do not hide it at small sizes."

5. **Subproof Row Rag on Mobile:**
   - *Issue:* NIRF Rank, NAAC A++, and Category I autonomy tags wrapped unevenly across 3 lines with awkward bullet points on 390px.
   - *Why it matters:* Clutters the hero decision hierarchy before the primary CTA pills.

---

## Changes Made (Pass 2)

| Property / Component | Before (Pass 1) | After (Pass 2) |
|---|---|---|
| `.hero-wordmark` background position | `center 32%` (sky exposure) | `45% 72%`, zoom `135%`, with 1.5px subtle stroke contour |
| `.hero-wordmark` font-size | `clamp(4.5rem, 16vw, 12rem)` | `clamp(6.5rem, 21vw, 15.5rem)`, leading `0.82` |
| `.brand-campus-tag` display | Always visible (colliding on mobile) | `display: none` below 640px; `display: block` at `>= 640px` |
| Work cards `img` loading | `loading="lazy"` (unpainted in fast capture) | Direct eager loading with explicit container aspect ratios |
| `.footer-skyline-wrapper` height | Unconstrained height (~95px on mobile) | Mobile `min-height: 200px`, desktop `360px`, preserving full massing |
| `.hero-subproof` layout | Flex with inline bullets | Modular `.hero-subproof-item` pills with subtle border & background |

---

## Verification against 4 Section D Tests (Pass 2)

1. **Squint Test (PASSED):** The two showpieces (the photo-filled `srm` hero wordmark and the illuminated TP+TP2 footer skyline) immediately stand out as the dominant anchors, with the UT statement bands providing balanced vertical weight in between.
2. **Three-Second Test (PASSED):** A first-time visitor immediately understands: SRM is a leading multi-disciplinary research institution in Kattankulathur, and the single primary action is prominent ("Apply for 2027").
3. **Subtraction Test (PASSED):** Removed superfluous decorative gradients, floating badge shadows, and duplicate secondary links. Every element on the page earns its place.
4. **Phone-Call Test (PASSED):** A visitor can succinctly describe the page: *"A clean white-and-royal-blue university site with a giant photo-filled 'srm' at the top, three bold full-bleed photo bands for learning, research, and campus life, followed by pathways, student work cards with photo credits, a timeline, and a twilight vector skyline of the Tech Park towers at the very bottom."*

---

## Not Verified
- Physical print stylesheets.
- VoiceOver / NVDA screen reader live announcement of dynamic menu drawer toggle (deferred to Phase 2 interaction build).
