# Architectural & Design Decisions (Phase 1)

## 1. Tech Stack
- **Choice:** Vite + static multi-page HTML + modular vanilla CSS (`styles/tokens.css`, `styles/base.css`, `styles/components.css`, `styles/skyline.css`).
- **Rationale:** Minimal dependencies, lightning-fast static builds, zero JS runtime overhead (satisfies "no JS needed beyond what a static site requires"), perfect for competition review and visual fidelity across viewports.

## 2. Typography
- **Display / Grotesk:** `Inter Tight` (weights 700, 800, 900) via Google Fonts — robust geometric grotesk for the giant hero wordmark, bold UT-style statement band headlines, and structural navigation.
- **Body & Editorial:** `Newsreader` (weights 400, 500, 400i) and `Source Serif 4` — warm, legible editorial serif with balanced proportions for pull-quotes, intro text, and editorial summaries.
- **Numeric:** Tabular numbers (`font-variant-numeric: tabular-nums`) enabled across all stats and counters.

## 3. Color Palette & Logo Extraction
- Primary SRM Accent: `#034DA1` (Official SRM Royal Blue, pulled directly from `srm-logo.svg`).
- Secondary Heritage Accent: `#C7A008` (SRM Ochre / Academic Gold from crest).
- Near-Black (Canvas Dark / Ink): `#111317` (rich tuned dark, avoiding harsh `#000000`).
- Light Surface Background: `#F8F9FA` (soft off-white, avoiding sterile `#ffffff`).
- Card Surface: `#FFFFFF` with hairline border `#E2E5E9` (1px structure) and subtle low-alpha elevation.
- Scrim Tone: Solid flat scrim `rgba(17, 19, 23, 0.72)` over statement band photography (no decorative gradients, strictly adhering to Craft Rule 1).

## 4. Hero Wordmark Treatment
- Committed to lowercase bold geometric `srm` (VCUarts-style) with University Building (`hero-campus-ub.webp`) clipped inside the letterforms using CSS `background-clip: text` and SVG mask fallback.
- Accompanied by a crisp editorial serif intro line and three distinct pill CTAs with clear hierarchy:
  1. Primary: "Apply for 2027" (solid royal blue)
  2. Secondary: "Explore programmes" (pill outline)
  3. Tertiary: "Schedule a visit" (pill outline)

## 5. Illustrated TP & TP2 Footer Skyline
- Handcrafted detailed vector illustration (`assets/skyline.svg` inline in footer) featuring Tech Park (TP, 15-storey curtain-wall tower with central vertical spine) and Tech Park 2 (TP2, modern multi-tiered computing complex) side by side.
- Vector layers cleanly separated with IDs: `#sky-layer`, `#buildings-tp`, `#buildings-tp2`, `#windows-grid`, `#foreground-trees-ground`.
- Seamless color continuation between the footer background `#111317` and the skyline twilight canvas.
