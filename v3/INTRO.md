# Tree reveal opening animation

Based on `claude/srm-homepage-redesign` at `620853d`. The source logo is unchanged.

The complete seal starts opaque. Only the tree becomes transparent during the zoom. The opening artwork retains the original blue branch and leaf details. The aperture uses only the original SVG tree’s outer contour, so a smooth eased reveal blends both those details and the white tree into the page as zooming starts. No silhouette swap occurs; the completed opening is one uninterrupted tree silhouette. The blue field, gold ring, lettering and foreground ribbon remain solid. A luminance mask cuts the tree through both the seal and its full-page cover; neither the artwork nor the cover fades away.

The artwork and aperture share one transform, fixed at the seal centre (89, 89), which stays at the viewport centre throughout playback. The final magnification expands the central tree opening beyond the viewport. Playback lasts 3.3 seconds, with a 5.5-second cleanup safeguard.

Skip, Escape, once-per-session playback, `?intro` replay and reduced-motion behaviour remain supported. Background content is temporarily inert during playback and restored on completion or skipping.

## Build

Run `python3 v3/tools/build_intro.py`, then `python3 v3/tools/build_preview.py`. The first script extracts the original seal and tree paths and writes the inline SVG in index.html. It validates the source logo structure before relying on its path ranges.

## Verification

Chromium tests covered source and bundled pages at 375px and 1440px. Pixel tests with a magenta page underlay confirmed that the tree becomes transparent while samples on the blue field, gold ring and ribbon stay opaque. Before cleanup, more than 98% of the viewport reveals the page. Transform checks across six animation frames kept the seal centre within 0.00004px of the viewport midpoint. Artwork and aperture transforms match throughout.

Interaction checks cover completion, Skip, Escape, session persistence, forced replay, reduced motion and restoration of background interaction.
