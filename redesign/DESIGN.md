# SRMIST homepage redesign: design notes (v2)

## The idea

**The motto is the page.** "Learn. Leap. Lead." has been SRM's line for years, so it becomes the structure of the page:

| Chapter | Field | What it holds |
|---|---|---|
| Hero | Full-bleed campus film, SRM blue scrim | The motto as the headline, one line on what SRM is, the programme finder overlapping the hero's edge, and the four strongest proof points |
| **Learn.** | White | The nine colleges as a large-type index with a live photo preview, then Admissions 2027 split by applicant type |
| **Leap.** | SRM blue | Research figures, start-ups, semester abroad, and a filmstrip of the start-up ecosystem |
| Campus | Cool paper | A photo mosaic of the 250-acre campus and the 360° tour |
| **Lead.** | White, then a full gold band | Placements as the page's biggest numbers, then alumni |
| News and events | Paper | Events remove themselves once they've passed |
| Close | Deep blue | "Your leap starts here." Apply or visit |

## Why v1 felt generic, and what changed

v1 was technically clean but could have belonged to any university. Its navy, polite serif and rounded-card grid are what an AI produces for any brief. v2 is built from what already makes srmist.edu.in look like SRM:

- **Butler**, SRM's own heavy high-contrast display face, set very large. In production it loads from srmist.edu.in. Bodoni Moda, the closest open typeface in the same style, takes over anywhere Butler can't load.
- **SRM blue `#0C4DA2` and gold `#E4B316` as whole fields**, not small accents. A blue chapter, a gold placements band, and a gold rule on the finder and footer.
- **SRM's gold underline**, taken from the current site's menu hover, as the one interaction signature: menus, tabs, college rows, links and section rules.
- **The campus film in the hero**, as on the current site, but loaded after the page, muted, and with a pause button (the WCAG 2.2.2 requirement for moving content). It doesn't play for reduced-motion or data-saver users.
- **A gold full stop** on every chapter word, the only decorative device on the page.

## Tokens

Colour: `--srm-blue #0C4DA2`, `--srm-blue-deep #072F6B`, `--srm-gold #E4B316`, `--srm-ink #0B1F44`, `--paper #F4F6FA`, `--tint #EDF3FC`. It's a single brand theme on purpose, and every colour is set explicitly.
Type: Butler (falling back to Bodoni Moda) for display at 900/800 weights, Source Sans 3 for body (the current site's body face). `+`, `#` and `,` inside display numbers are set in the body face because Didone hairlines make them disappear.
Shape: 4px radius on controls, square photos. Elevation: one float shadow, used only for the finder, menus and dialogs.
Motion: 150–320ms `cubic-bezier(0.2,0,0,1)`, transform and opacity only, with `prefers-reduced-motion` respected.

## Verified

- 0 axe-core WCAG 2.1 A/AA violations at 1440px and 390px.
- No horizontal page scroll at 1440, 820 or 390px. Only the filmstrip and alumni rail scroll sideways, by design, and both are keyboard-focusable regions.
- Tabs, menus, the drawer, the search dialog and auto-expiring events all work. The October BMR event drops off automatically.

## Builds

- `index.html` is the production page. It references srmist.edu.in assets directly.
- `tools/build_preview.py` builds `preview/`, the competition link. It adds a permanent concept-entry banner, inlines CSS and JS, uses local photo copies from `assets/img/`, and turns form submissions into hand-off links (the preview host blocks external images, embeds and cross-site forms).
