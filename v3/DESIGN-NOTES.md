# Local refinement of the 06c41e2 homepage

## Current footer direction

The user's latest references supersede the earlier white-building panorama. Use a light, bordered navigation grid, a restrained social/clock/copyright row, and a full-width illustrated campus landscape below. Keep the existing SRM logo, Manrope typography, neutral page ground (#fafafa), ink (#121418), subtle borders (#e2e3e6), and SRM gold for interaction accents.

The supplied UB photograph is the architectural reference: compact sandstone tower, teal arched windows, the original three-quarter orientation, and its lower right wing above the lakeside tree line. The second reference supplies the illustrated foliage, luminous clouds, quiet colour, and light footer layout. Do not use the earlier elongated white facade. Scale the scene uniformly, including on phones, so the complete composition remains visible.

## Asset provenance

`assets/img/ub-lakeside-footer.webp` is an AI-assisted lakeside illustration based on the user's supplied UB photo, with the supplied scenic footer as its style reference. The electric pylon was removed and natural scenery expanded. It is an illustration, not the unaltered source photograph. The original generated PNG remains in the execution workspace. The rejected panorama asset is removed from source and preview assets.

Official university destinations and the three linked news stories come from the repository's `current/index.html` snapshot. Existing photographs and recruiter logos retain their source assets and credits. Links do not independently reverify the university's existing factual claims.

## Other retained improvements

- Naturally scrolling image sections on phones and in reduced-motion mode.
- Native modal navigation with background focus containment and Escape handling.
- Photo rotation skips failed images and pauses on focus, offscreen, and when the document is hidden.
- Real destination links, linked campus news, readable secondary-page content, and usable phone links.

## Local verification

Both source pages and both bundled previews are checked in Chromium at 320, 375, 768, 1024 and 1440 pixels. Checks cover overflow, image loading and preserved aspect ratio, four footer disclosure groups, and keyboard toggling. Desktop and phone screenshots are reviewed. JavaScript syntax, preview generation and Git whitespace checks are also run. Earlier checks covered modal focus, photo controls and failures, reduced motion and use without JavaScript.

Not exercised: assistive technology with an actual screen reader, live availability of every external university page, and independent verification of existing statistics.

## Delivery

Implemented on `codex/srm-local-polish`, based on upstream commit `06c41e2`. The matching design is published at https://srm-campus-footer-preview.dhruvvvgg.chatgpt.site. This branch includes the source, illustration asset and rebuilt competition previews.

Run `python3 -m http.server 8000` from the repository root and open `/v3/`. Rebuild the bundled preview with `python3 v3/tools/build_preview.py`.
