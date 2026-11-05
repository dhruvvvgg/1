# Seal-window opening animation

Based on `claude/srm-homepage-redesign` at `620853d`. The source logo is unchanged.

The original implementation simultaneously faded the emblem and its full-page cover and opened a generic radial window. The replacement uses the seal's original vector artwork and a luminance mask. The three reveal regions are the upper blue field and its lower-left and lower-right areas, clipped to the actual inner circle. The tree's outer silhouette and the ribbon protect their ink, including the small blue leaf details. Only the three larger negative-space regions become transparent.

The mark starts fully opaque. Once the windows open, the artwork and mask share one transform, and the camera travels towards the lower-right opening at seal coordinate (115, 114). The zoom grows that window past the viewport boundaries. Neither the artwork nor the overall cover fades out. The opening lasts 3.3 seconds, with a 5.5-second cleanup safeguard.

Skip, Escape, once-per-session playback, `?intro` replay, and reduced-motion behaviour remain supported. Background content is temporarily inert during playback and restored on completion or skipping.

## Build

Run `python3 v3/tools/build_intro.py`, then `python3 v3/tools/build_preview.py`. The first script extracts the original seal paths and writes the inline SVG in index.html. It validates the source logo structure before relying on its path ranges.

## Verification

Chromium tests covered source and bundled pages at 375px and 1440px. Verified three apertures, identical artwork/mask transforms, opacity 1 on the overlay and artwork, cleanup, restored background interaction, Skip, Escape, session persistence, replay and reduced motion.

Pixel tests used a magenta page underlay: zero pixels showed through initially, only small window regions showed through mid-animation, and over 98% of the viewport was revealed before cleanup. Samples on the gold ring and tree stayed opaque. This catches accidental global fading and an opaque cover behind otherwise transparent logo holes. Desktop and phone frames were visually reviewed.
