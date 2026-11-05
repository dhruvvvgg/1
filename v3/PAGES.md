# Five connected pages

Preserve the existing homepage's Manrope headings, Newsreader body, #fafafa ground, #121418 ink, #e4b316 gold, 4/8 spacing scale, rounded photographs, restrained motion, and light grid / UB lakeside footer. Existing branding is the design system; these pages extend it.

Each page has its own job and composition:
- Admissions: choose a route, understand the steps, prepare documents and contact the correct team. Full-background campus-photo hero, interactive route guide, sequential checklist and native FAQs.
- Academics: explore subjects and study levels. Full-background Tech Park hero, searchable academic-area directory, inline area details and links to the relevant admission route.
- Placements: understand career preparation and explore recruiters. Placement-group photo hero, preparation sequence, existing recruiter-logo gallery with search, and distinct student/recruiter next steps.
- Research: understand the research ecosystem and pathways. Laboratory photo hero, research themes, facilities and doctoral / collaboration guidance.
- Campus Life: explore the campus as a place to live. Performance photo hero, festival / clubs image stories, housing and support information, and a visit section with directions.

The repeated design elements are typography, spacing, navigation, section framing and footer. Content determines the layout; do not fill every page with identical feature cards or unsupported statistics.

## Content and source limits

Live pages at /admissions/, /departments/, /placements/, /research/ and /life-at-srm/ returned HTTP 403 during retrieval. Content is grounded in current/index.html, the existing homepage and credited Wikimedia assets. No current deadlines, fees, salary promises, intake counts or eligibility thresholds are invented. Academic areas are a subject guide, not a complete programme catalogue. Recruiter logos are examples already included in the repository, not guarantees of current openings. Admissions provides guidance and phone contact, not a simulated application submission.

Header, menu, footer and relevant homepage links route locally. Actual map, phone, social, news and legal destinations remain external where appropriate. The concept note remains visible.

## Authoring

Shared chrome comes from index.html. Edit pages/*.html, data/areas.json, or data/recruiters.json, then run tools/build_pages.py followed by tools/build_preview.py. All outputs are static and can be opened without a framework. Controls progressively enhance content that remains available without JavaScript.

## Verification

Chromium checks passed for all five pages at 320, 375, 768, 1024 and 1440 pixels, in both source and bundled previews (50 page/width combinations). Verified: no overflow, loaded images, page headings and active navigation, retained footer, and mobile modal navigation. Interaction checks passed for combined subject filters, search, reset and empty states, URL persistence, native subject disclosures, admissions route selection and the recruiter search. All five homepage navigation links were clicked and stayed on the same origin. With JavaScript disabled, the academic directory, native disclosures, admission guidance and mobile navigation remained usable.

The static gate checks all 14 source/preview documents for local files, fragment targets, unique IDs, one H1 and image metadata. JavaScript syntax and preview builds also pass. Desktop and phone screenshots were reviewed. Live source retrieval remains blocked with HTTP 403; current fees, deadlines and programme eligibility are not asserted.

## Photographic revision

The current photographic layout supersedes the earlier split heroes. All page heroes are full background images, and breadcrumbs are removed. See PHOTOGRAPHY.md and data/photography.json for discovery, source URLs and image provenance.
