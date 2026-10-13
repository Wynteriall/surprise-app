/**
 * Staged Tulip Hero Haptic Cues, decided through the journey-decision seam.
 *
 * The Tulip Hero UI asks this adapter (never the seam order or fire-once
 * rules directly) which cue a stage may fire. Stage-to-cue mapping, fire-once
 * per target, and the haptic toggle all stay in `journey-decisions.ts`; this
 * adapter only names the per-stage target. Motion and haptics stay
 * independently controlled per the seam: reduced-motion silence is
 * structural (the static bloom enters no stages, so no cue is requested),
 * never a mute here.
 */
import {
  getHeroStageHaptic,
  shouldFireHaptic,
  type HapticCue,
  type HeroStage,
  type JourneyPreferences,
} from './journey-decisions';

/** Stable per-stage haptic target so each stage fires independently once. */
export function getHeroHapticTarget(stage: HeroStage): string {
  return `hero-${stage}`;
}

/**
 * Decides which Haptic Cue a Tulip Hero stage may fire now, or null to stay
 * silent. Returns null for idle stages, already-fired stages, and a muted
 * toggle.
 */
export function shouldFireHeroStageHaptic(
  stage: HeroStage,
  firedTargetIds: readonly string[],
  preferences: JourneyPreferences,
): HapticCue | null {
  const cue = getHeroStageHaptic(stage);
  if (cue === null) {
    return null;
  }
  if (
    !shouldFireHaptic(getHeroHapticTarget(stage), firedTargetIds, preferences)
  ) {
    return null;
  }
  return cue;
}
