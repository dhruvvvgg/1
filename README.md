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
