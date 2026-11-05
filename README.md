# SRM Website Design Challenge 2026: homepage redesign

A proposed redesign of the srmist.edu.in homepage for the SRM Website Design Challenge 2026.

| Path | What it is |
|---|---|
| `v3/index.html` | Latest homepage concept, with photo-filled SRM wordmark and white-and-teal campus-building footer |
| `v3/preview/index.html` | Latest competition preview with inlined CSS and JavaScript |
| `v3/FOOTER.md` | Footer design decisions, image provenance, and verification |
| `current/index.html` | Snapshot of the live homepage (4 Nov 2026), with asset paths pointed back at srmist.edu.in so it renders as it does today |
| `redesign/index.html` | The redesigned homepage (HTML + `assets/css/main.css` + `assets/js/main.js`, no build step, no dependencies) |
| `redesign/standalone.html` | The same page in a single file. Double-click to open it in any browser |
| `redesign/DESIGN.md` | Design tokens, decisions, before/after comparison and self-review |
| `research/01-current-homepage-audit.md` | Audit of the current homepage |

## Run locally

```bash
cd v3 && python3 -m http.server 8000
```

Then open http://localhost:8000. The v3 images and logo are local; Google Fonts requires an internet connection. Rebuild the bundled preview with `python3 tools/build_preview.py`.
