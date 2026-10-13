# 04: Beat primitives

**What to build:** composable beat primitives plus a Beat composer, demoable as one sample beat scrolling with reveal and haptics.

**Blocked by:** 01 scaffold shell, 02 journey decisions plus placeholder beats.

**Status:** ready-for-agent

- [x] Reveal text, float photo, drawn line, and glow spacer compose in any order with delay and haptic props
- [x] Sample beat reveals text with fade or rise and photo with pop or parallax on scroll
- [x] Reveal and photo haptics fire once each
- [x] Reduced-motion reveals instantly with no parallax

## Comments

- Implemented 2026-10-13 via TDD through the journey-decision seam
  (`src/journey/useBeatReveal.ts` plus `src/journey/beat-haptics.ts`):
  red (missing modules) then green (testID multiplicity from the
  Reanimated/SVG mock passthrough, then an instant-reveal haptic gap where
  the mount-revealed beat skipped cue firing). The four Beat Block
  primitives (`src/journey/BeatBlocks.tsx`) stay dumb — revealed, delay,
  and instant props only — while the Beat composer
  (`src/journey/StoryBeatView.tsx`) stacks any ordered block list with
  per-block stagger delay and data-driven haptics, asking the seam for
  reveal-once, fire-once, toggle, and instant; SVG plus Reanimated only
  (transform and opacity, no Skia, no remote photos).
- Evidence: `tsc --noEmit` clean, `eslint .` clean, `prettier --check .`
  clean, `jest` 45/45 green (20 seam plus 6 hero-haptic adapter plus 5
  Tulip Hero behavior plus 5 beat-haptic adapter plus 9 beat primitive
  behavior tests), `expo install --check` up to date,
  `expo export --platform android` bundles to dist with no errors.
  `app/index.tsx` demos one sample Story Beat (`small-habit`: rise text
  plus pop photo) scrolling below the Tulip Hero with scroll-driven
  `isInView` and the haptic toggle as input, default on.
- Photo files: `assets/` does not exist on disk, so both placeholder
  photo paths (`small-habit.jpg`, `thing-taught.jpg`) are missing; the
  float-photo block degrades to a labeled SVG placeholder via the empty
  `src/journey/beat-photos.ts` registry instead of crashing. Real photos
  land later as static registry entries, local-only.
- Code review (Standards + Spec): no blockers. Fixed pre-review the
  `react-hooks/set-state-in-effect` lint (reveal now commits during
  render, mirroring `useHeroSequence`'s prefs sync, while cues fire from
  the effect under the fired-target guard). Accepted as-is: mild
  reveal-effect duplication across text/photo variants, per-scroll-event
  `setState` in the one-beat demo (revisit in 05 assembly), and the
  commented registry example as documentation. Deferred with rationale:
  scroll-linked parallax offset wires with the full journey assembly in
  ticket 05 (parallax here is a translateY entrance); haptic toggle UI
  stays with ticket 05.
- Owed to human: on-device Expo Go visual plus FPS feel check.
