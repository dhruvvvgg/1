# Phase 1 decisions

- Branch: `codex-srm-design-phase`. Work in the existing checkout.
- Scope follows the supplied handover: static visual design only; no animation, live data, carousels, or application flows.
- Vite and plain CSS, with a small Python standard-library renderer for shared static header/footer. The browser receives no JavaScript. `npm run build` regenerates all three HTML pages.
- Manrope 800 gives the SRM letterforms weight; Newsreader gives introductory and editorial copy a quieter voice. Both are self-hosted with OFL licenses.
- Cool off-white, slate ink, SRM blue. Large clipped uppercase SRM wordmark and illustrated skyline are the two showpieces. Intermediate content uses a repeated left-aligned heading/copy/link pattern, full-width bands, then quiet editorial cards.
- Rejected generic alternatives: no warm cream palette, ornamental eyebrows, shadowed card kit, decorative gradients, or repeated arrow links.
- Official imagery is blocked by the current proxy allowlist (CONNECT 403). Added `srmist.edu.in` and `www.srmist.edu.in` to the environment draft. Publication is separate; saving the draft did not change current network access.
- Use locally drawn, explicitly labelled architectural/studio placeholders. These are not photographs or representations of actual SRM facilities. No stock imagery substitutes for SRM. The hero mask is ready for a locally downloaded WebP replacement.
- Official logo unavailable: use a text identity labelled as a design study. The accent is provisionally `#0c4da2` from the repository audit; TODO: verify against the official logo.
- Avoid invented statistics. Each statement band has an explicitly labelled fact line awaiting verification. Milestone dates remain TODO: verify. The quote is original editorial copy, not attributed to a real person.
- External actions link to official SRM destinations and carry ↗. The second-level template is Academics; disciplines are illustrative navigation content, not a verified programme catalogue. Partners remain text-labelled placeholders, without invented affiliations.
- Native details/summary elements provide footer accordions. Their open resting state is readable at all widths. Motion is limited to 160ms transform/opacity feedback; reduced motion removes it.
