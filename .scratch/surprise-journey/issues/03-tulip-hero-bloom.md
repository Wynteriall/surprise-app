# 03: Tulip Hero bloom

**What to build:** the gated Tulip Hero from Click Me through bloom with staged haptics, glow, and drawn lines, demoable in Expo Go.

**Blocked by:** 01 scaffold shell, 02 journey decisions plus placeholder beats.

**Status:** ready-for-agent

- [x] Click Me fades in, tap fades it out with a light cue, then seed pops, falls, sprouts, grows stems and roots, sprouts the flower, and blooms
- [x] Staged haptics fire once per stage with medium at full bloom
- [x] Black gradient with light bloom and staggered drawn lines renders smoothly
- [x] Reduced-motion shows the static bloom with no staged ticks

## Comments

- Implemented 2026-10-13 via TDD through the journey-decision seam
  (`src/journey/useHeroSequence.ts` plus `src/journey/hero-haptics.ts`):
  red (missing adapter, then chained-timer and mock failures) then green.
  The Tulip Hero UI (`src/journey/TulipHero.tsx`) asks the seam what to do
  via `getInitialHeroStage`/`getNextHeroStage` plus a transition-driven
  visited set, never re-encodes stage order; SVG plus Reanimated only
  (transform and opacity, no Skia, no image).
- Evidence: `tsc --noEmit` clean, `eslint .` clean, `prettier --check .`
  clean, `jest` 31/31 green (20 seam plus 6 staged-haptic adapter plus 5
  Tulip Hero behavior tests), `expo install --check` up to date,
  `expo export --platform android` bundles to dist with no errors.
- Code review (Standards + Spec): fixed the adapter reduced-motion fork
  (now pure seam delegation with structural silence), index-arithmetic
  visibility (now seam-transition visited set), SVG shell plus static-stack
  duplication (`HeroArt`, `PLANT_ART`), and gate shared-value mutation.
  Deferred with rationale: haptic toggle UI stays with ticket 05, line
  stagger is timing-based per the transform-and-opacity-only budget, beat
  reduced-motion stays with tickets 04/05.
- Re-review (Standards + Spec) follow-ups: `reduceMotionChanged`
  subscription in `app/index.tsx`, stable `DrawnLineSpec` ids, dropped the
  gate-press passthrough, documented the Skia guard as a
  dependency-constraint test. Remaining notes accepted as-is: "Bloom
  Sequence"/"static bloom" match the frozen seam plus ticket wording, and
  per-stage dwell keys stay explicit. Gates re-green (31/31).
- Owed to human: on-device Expo Go visual plus FPS feel check.
