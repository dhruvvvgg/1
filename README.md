# SRM Website Design Challenge 2026: homepage redesign

A proposed redesign of the srmist.edu.in homepage for the SRM Website Design Challenge 2026.

| Path | What it is |
|---|---|
| `current/index.html` | Snapshot of the live homepage (4 Nov 2026), with asset paths pointed back at srmist.edu.in so it renders as it does today |
| `redesign/index.html` | The redesigned homepage (HTML + `assets/css/main.css` + `assets/js/main.js`, no build step, no dependencies) |
| `redesign/standalone.html` | The same page in a single file. Double-click to open it in any browser |
| `redesign/DESIGN.md` | Design tokens, decisions, before/after comparison and self-review |
| `research/01-current-homepage-audit.md` | Audit of the current homepage |

## Run locally

```bash
cd redesign && python3 -m http.server 8000
```

Then open http://localhost:8000. Images and logos load from srmist.edu.in, so you need an internet connection.

## Latest connected redesign (v3)

The current design is in `v3/`. It includes Admissions, Academics, Placements, Research and Campus Life, shared local navigation, and the UB lakeside footer.

```bash
python3 v3/tools/build_pages.py
python3 v3/tools/build_preview.py
python3 v3/tools/check_pages.py
python3 -m http.server 8000
```

Open http://localhost:8000/v3/. Edit `v3/pages/` for page content and `v3/data/` for directory data. The generated `v3/preview/` pages inline their CSS and JavaScript. Design, content-source limits and verification are documented in `v3/PAGES.md`.
