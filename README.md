# SRM IST — static design phase

Independent competition design study for SRM Institute of Science and Technology, Kattankulathur. Homepage, full menu and a second-level Academics template. Vite + plain CSS; no JavaScript shipped to the browser. Current branch: `codex-srm-design-phase`.

## Run

Requires Node 20.19+ or 22.12+ and Python 3. Validated here with Node 24.22.1 and Python 3.12.14.

```sh
npm ci
python3 scripts/render.py
npm run dev
```

Source components and content live in `scripts/render.py`; rerun it after changes when using the dev server. Generated entrypoints (`index.html`, `menu.html`, `academics.html`) are committed for easy inspection. Edit CSS directly in `styles/`; shared tokens live in `styles/tokens.css`.

```sh
npm run build
npm run preview -- --port 4173
```

Build regenerates the HTML and outputs the static site to `dist/`. The preview server must run while browser checks execute in another terminal:

```sh
npm run check
```

The check runner needs Chromium (`/usr/bin/chromium` here; override with `CHROMIUM_PATH`). It captures all three pages at 390, 768, 1280 and 1920px and runs axe, overflow, image, local-link, semantic heading, skip-link, navigation and accordion checks. Screenshots and results are written under `docs/screenshots/pass-2/`; use `REVIEW_PASS=1` for a separate first pass. Browser testing dependencies are development-only.

## Design handoff

- [Design decisions](docs/decisions.md)
- [Two-pass design review](docs/design-review-1.md)
- [Content and asset verification inventory](docs/verification-inventory.md)
- [Asset credits](assets/CREDITS.md)

Official imagery is currently blocked by network policy. Clearly labelled local illustrations occupy the slots; they do not depict actual SRM facilities. Replace them before submission. Source PNGs are in `assets/raw/`; WebPs are in `assets/img/`. `scripts/make-placeholders.py` optionally regenerates illustrations using Pillow; Pillow is not required to build or run the site.

Only static visual design and basic link/button feedback belong to this phase. No scroll effects, JavaScript animation, live clock, carousels or application backend.
