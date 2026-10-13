# Spec: Surprise Scroll Journey

**Status:** ready-for-agent

## Problem Statement

As someone learning mobile development, I want a small personal app that feels magical for my girlfriend and teaches me production-grade animation, UI/UX, and performance, so that I build real skill while making something wholesome.

## Solution

A single dark Scroll Journey in Expo Go: a gated Tulip Hero running a seed-to-bloom sequence with staged Haptic Cues, followed by five Story Beats composed from small Beat Blocks (text reveal, photo pop/parallax, drawn lines, glow spacers), closing with a Finale hearts bloom. Content stays editable as data so placeholders become the real story without code changes.

## User Stories

1. As the giver, I want a Click Me gate fading in on open, so that she starts the magic deliberately.
2. As the giver, I want tapping Click Me to fade it out with a light Haptic Cue, so that the start feels responsive.
3. As the viewer, I want a seed popping at the top then falling to the middle, so that growth has a playful beginning.
4. As the viewer, I want a bud sprouting at the middle with a haptic tick, so that I feel growth begin.
5. As the viewer, I want stems and roots growing with a haptic tick, so that the plant feels alive.
6. As the viewer, I want the bud lowering then a flower sprouting with a haptic tick, so that the bloom feels staged.
7. As the viewer, I want the tulip blooming with a medium Haptic Cue plus light glow, so that the payoff lands.
8. As the viewer, I want a black gradient with transparency and light blooming plus staggered drawn lines, so that the hero feels magical.
9. As the giver, I want the tulip built in code with SVG plus Reanimated (no Skia, no image), so that I learn performant code-drawn animation in Expo Go.
10. As the viewer, I want scrolling to travel beat by beat, so that it feels like a journey, not a document.
11. As the viewer, I want each Story Beat as blended Snippets plus at most small photos, so that I am never cluttered.
12. As the viewer, I want text fading/rising in on scroll with subtle parallax on photos, so that motion feels smooth.
13. As the viewer, I want photos popping with a medium Haptic Cue on reveal, so that pictures feel alive.
14. As the viewer, I want snippet reveals with a light Haptic Cue fired once, so that travel is marked without buzzing.
15. As the viewer, I want magical accents only at Hero and Finale, so that beats stay calm and wholesome.
16. As the giver, I want beats composed from small primitives (reveal text, float photo, drawn line, glow spacer) in any order, so that I can build layouts beat by beat.
17. As the giver, I want placeholder beats editable as data (five moments), so that I can swap real words and local photos later.
18. As the viewer, I want a haptic toggle, so that I control the senses.
19. As the viewer with reduced motion, I want the hero skipping to a static bloom and beats revealing instantly, so that the app stays comfortable.
20. As the learner, I want strict TypeScript plus lint plus Prettier plus feature folders plus review per ticket, so that I practice production standards.
21. As the learner, I want transform and opacity only animation with optimized local photos, so that scrolling holds 60fps.
22. As the learner, I want each vertical slice verifiable by Jest plus Expo Go visual plus FPS feel, so that progress is testable.

## Implementation Decisions

- Single-route scroll experience using the confirmed stack: Expo Go plus TypeScript plus Expo Router plus Reanimated plus gesture support plus haptics, no backend, no auth, local assets only.
- Tulip Hero as a gated seven-stage Bloom Sequence: Click Me fade in, tap fade out, seed pop and fall, bud sprout, stems plus roots grow, flower sprout, bloom plus glow with staggered line drawing.
- Haptic pattern: three staged Light ticks across grow, Medium at full bloom and at photo pop and finale, Light at snippet reveal, each fired once per target; no continuous or per-frame haptics.
- Beat model: Hero followed by five Beats followed by Finale; each Beat is an ordered list of Beat Blocks, never a full letter block or photo dump.
- Primitive set: reveal-text (fade or rise), float-photo (pop or parallax), drawn-line, glow-spacer, stacked inside a Beat composer with delay plus haptic props.
- Theme: dark throughout with pink tulip tokens (blush background depth, deep-rose text, leaf accent, glow), system font first with custom font deferred to a later slice.
- Content: placeholder beats (first meet, small habit, hard-day support, thing taught, future wish) as editable data with a block-list schema (identity, ordered blocks of text or photo or line or spacer, per-block animation choice and haptic choice, alt text for photos); photos local and optimized.
- Motion and perf budget: transform and opacity only, memoized beats in a ScrollView (no virtualization at this size), images capped and compressed.
- Accessibility: reduced-motion path skips the hero timeline to a static bloom and reveals beats instantly without parallax; haptic toggle mutes all cues.
- Seam: single highest pure journey-decision seam covering hero transitions, reveal-once, haptic-fire-once, and content validity with reduced-motion and toggle as inputs.

## Testing Decisions

- A good test asserts external behavior (stage reached, reveal happened once, haptic fired once, content valid) and never asserts animation frames, spring parameters, or pixel output.
- Tested through the single journey-decision seam: hero stage transitions, beat reveal-once, haptic-fire-once under toggle and reduced-motion, placeholder content validity.
- Prior art: none; this greenfield spec establishes the first Jest pattern for later slices to follow.
- Animation smoothness and glow feel are verified manually in Expo Go by scroll feel and FPS check, not by unit tests.

## Out of Scope

- Backend, accounts, sync, push, analytics, crash reporting.
- OTA updates, CI pipelines, E2E suites.
- Custom fonts in the first slices (deferred).
- React Native Skia or image-based flowers.
- Remote-hosted photos or user uploads.
- Sound effects or per-frame haptics.
- Light theme or per-beat particle systems.

## Further Notes

- ADR candidate during build: SVG plus Reanimated over Skia (dependency weight versus richness, Expo Go compatibility).
- Slice Done bar per ticket: Jest green plus Expo Go visual plus FPS feel plus code review.
- Learning spine stays animation-first with UI/UX and performance as supporting checks inside each slice.
