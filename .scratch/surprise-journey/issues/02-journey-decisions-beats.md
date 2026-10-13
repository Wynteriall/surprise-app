# 02: Journey decisions plus placeholder beats

**What to build:** the pure journey-decision logic plus five editable placeholder beats, verified by unit tests without rendering animation.

**Blocked by:** 01 scaffold shell.

**Status:** ready-for-agent

- [x] Hero stage transitions advance through the gated bloom order and stop at bloom
- [x] Beat reveal fires once per beat and haptic fires once per target under toggle on
- [x] Reduced-motion path skips to bloomed plus instant reveal
- [x] Placeholder beats content validates (five moments, short snippets, optional photo each)

## Comments

- Implemented 2026-10-13 via TDD at the journey-decision seam
  (`src/journey/journey-decisions.ts`): red (missing seam functions) then
  green.
- Evidence: `tsc --noEmit` clean, `eslint .` clean, `prettier --check .`
  clean, `jest` 20/20 green in the single seam test file
  (`src/journey/__tests__/journey-decisions.test.ts`); new editable data in
  `src/journey/placeholder-beats.ts`. Hero haptic mapping, reveal-once,
  haptic-fire-once, instant-reveal flag, plus Story Beat block schema and
  validator extend the seam; no UI rendered in this slice.
- Code review (Standards + Spec): fixed unused `BeatHapticChoice` export,
  extracted `makeFive` test helper, gave photo slots local asset paths;
  finale Medium cue stays with ticket 05. Committed as `81c260c`.
- Owed to human: on-device Expo Go visual plus scroll feel check.
