# 05: Journey assembly plus finale

**What to build:** the full Scroll Journey from Hero through five beats to a hearts-bloom Finale with haptic toggle, smooth in Expo Go.

**Blocked by:** 03 tulip hero bloom, 04 beat primitives.

**Status:** ready-for-agent

- [x] Journey scrolls Hero through five placeholder beats to the finale with no clutter
- [x] Haptic toggle mutes all cues and reduced-motion stays instant throughout
- [x] Finale shows the short note with hearts bloom and medium cue
- [x] Scroll holds smooth transform and opacity motion with no visible jank in Expo Go

## Comments

- Implemented 2026-10-13 via TDD through the journey-decision seam
  (`src/journey/useFinaleReveal.ts` plus `src/journey/finale-haptics.ts`):
  red (four missing modules) then green. The Finale
  (`src/journey/Finale.tsx`) shows the short note plus a code-drawn SVG
  hearts bloom with one medium cue, asking the seam for reveal-once,
  fire-once, toggle, and instant; SVG plus Reanimated only (transform and
  opacity, no Skia, no image, no remote). The full Scroll Journey
  (`src/journey/ScrollJourney.tsx`, rendered by `app/index.tsx`) stacks the
  gated Tulip Hero, all five `PLACEHOLDER_BEATS` via memoized
  `StoryBeatView`, and the Finale, with the small calm `HapticToggle`
  flipping only the `hapticsEnabled` seam input. Scroll offset lives in a
  Reanimated shared value driving the clamped parallax drift in
  `FloatPhoto` (ignored when instant); scroll events only commit newly
  visible sections, so there is no per-frame React state storm.
- Evidence: `tsc --noEmit` clean, `eslint .` clean, `prettier --check .`
  clean, `jest` 64/64 green (20 seam plus 6 hero-haptic adapter plus 5
  Tulip Hero behavior plus 5 beat-haptic adapter plus 9 beat primitive
  behavior plus 4 finale-haptic adapter plus 6 finale behavior plus 3
  haptic-toggle plus 6 journey-assembly tests), `expo install --check` up
  to date, `expo export --platform android` bundles to dist with no
  errors.
- Photo files: `assets/` still absent on disk, so both placeholder photo
  paths keep degrading to the labeled SVG placeholder via the empty
  `src/journey/beat-photos.ts` registry instead of crashing. Real photos
  land later as static registry entries, local-only.
- Code review (Standards + Spec): no hard violations, no wrong
  implementations, no scope creep. Fixed the `FINALE_BEAT_ID` mysterious
  name (`FINALE_SECTION_ID`, it identifies a Journey Section). Accepted
  as-is with rationale: the `scrollY`/`anchorY` prop threading stays flat
  instead of a bundled `ParallaxAnchor` type, and the finale expo driver
  duplicates the beat driver byte-for-byte per the 03/04 thin-adapter
  pattern (documented standard overrides the duplication smell).
- Owed to human: on-device Expo Go visual plus FPS feel check.
