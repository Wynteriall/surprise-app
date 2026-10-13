# 01: Scaffold shell

**What to build:** an Expo app that opens in Expo Go on the dark journey theme with strict types, lint, and the test runner all green.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] App opens in Expo Go to a blank dark journey with no errors
- [x] Strict typecheck passes
- [x] Lint passes
- [x] Test runner runs green with one placeholder test

## Comments

- Implemented 2026-10-13 via TDD at the journey-decision seam
  (`src/journey/journey-decisions.ts`): red (missing module) then green.
- Evidence: `tsc --noEmit` clean, `eslint .` clean, `prettier --check .`
  clean, `jest` 3/3 green in the single seam test file
  (`src/journey/__tests__/journey-decisions.test.ts`), `expo install --check`
  up to date, `expo export --platform android` bundles to dist with no errors.
- The one test file is the first external-behavior Jest pattern (stage
  reached, order advanced, stops at bloom; no frames/pixels), with 3
  assertions. Stage order plus initial-stage helpers bootstrap the seam;
  reveal-once, haptic-fire-once, and content validity stay with ticket 02.
- Code review (Standards + Spec): no blockers, 8 minors/nits fixed
  (hard-coded expected order, `@types/node` direct dep, glossary-aligned
  names, seam comments).
- Owed to human: on-device Expo Go visual plus scroll feel check.
