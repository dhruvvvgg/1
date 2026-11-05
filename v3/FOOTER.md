# Footer direction

The reference ends with architecture emerging from an open, light background and sitting on a narrow colour strip. SRM's white facade and teal arched windows are the identifying detail here. Keep the complete building visible, including its roofline, rather than stretching a short photograph into a panorama.

- Palette: page ground `#fafafa`, white stone `#ffffff`, existing navy `#0e1b33`, existing SRM gold `#e4b316`, existing footer text `#d9deea`.
- Typography: retain Manrope for navigation and the clock; add no headline over the building.
- Layout: existing left-aligned footer navigation, then a full-width light field with one centred building, grounded by a thin gold stripe and navy base. Scale the complete cutout down on phones, without cropping or horizontal scrolling.
- Motion: keep the illustration still. Retain the live IST clock and native mobile accordions.

Review against the brief: a generic multi-building illustration would lose the supplied building's identity. Use the supplied white-and-teal architecture alone. Do not add invented campus wings, decorative skies, or a second slogan.

## Asset provenance

`assets/img/campus-building.webp` is an AI-assisted architectural illustration based on the user's white-and-teal building reference, generated with a transparent background. Vegetation and sky were removed and obscured facade areas reconstructed. It is an interpretation, not an unaltered campus photograph. Other photographs keep their existing credits.

## Local preview

From the repository root, run `python3 -m http.server 8000`, then open `/v3/`. Rebuild the self-contained competition preview with `python3 v3/tools/build_preview.py` after editing the source HTML, CSS, or JavaScript.

## Verification

Chromium checks covered the homepage, second-level page, and both bundled previews at 320, 375, 768, and 1440 pixels. Verified: no horizontal overflow, complete loaded building image inside its scene, expected accordion state at each breakpoint, keyboard accordion toggling, and a populated IST clock. Native accordions also worked with JavaScript disabled. Reviewed desktop and phone footer screenshots. JavaScript syntax and preview generation passed. The earlier `redesign/` concept is unchanged.
