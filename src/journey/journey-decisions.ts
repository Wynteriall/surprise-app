/**
 * Pure journey decisions for the Scroll Journey.
 *
 * This is the single journey-decision seam: UI layers (Tulip Hero, Story Beats,
 * Finale) ask these functions what to do and never encode stage order,
 * reveal-once, haptic-fire-once, or content validity themselves.
 * Reduced-motion and the haptic toggle enter here as inputs.
 */

/** One stage of the gated seven-stage Tulip Hero Bloom Sequence. */
export type HeroStage =
  'gate-in' | 'gate-out' | 'seed' | 'bud' | 'stems' | 'flower' | 'bloom';

/** The gated bloom order. The sequence stops at bloom. */
export const HERO_STAGE_ORDER: readonly HeroStage[] = [
  'gate-in',
  'gate-out',
  'seed',
  'bud',
  'stems',
  'flower',
  'bloom',
];

/**
 * Viewer preferences that shape journey decisions.
 * hapticsEnabled is a forward-compat input for the haptic-fire-once
 * decisions; the current stage helpers only branch on reducedMotion.
 */
export interface JourneyPreferences {
  hapticsEnabled: boolean;
  reducedMotion: boolean;
}

/**
 * Decides the opening Tulip Hero stage.
 * Reduced motion skips the timeline straight to the static bloom.
 */
export function getInitialHeroStage(
  preferences: JourneyPreferences,
): HeroStage {
  if (preferences.reducedMotion) {
    return 'bloom';
  }
  return 'gate-in';
}

/**
 * Decides the next Bloom Sequence stage, or null once the bloom is reached.
 */
export function getNextHeroStage(current: HeroStage): HeroStage | null {
  const index = HERO_STAGE_ORDER.indexOf(current);
  if (index === -1) {
    return null;
  }
  const next: HeroStage | undefined = HERO_STAGE_ORDER[index + 1];
  return next ?? null;
}
