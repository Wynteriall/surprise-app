/**
 * Finale hearts-bloom Haptic Cue, decided through the journey-decision seam.
 *
 * The Finale UI asks this adapter (never the fire-once rules directly)
 * whether its single medium cue may fire. Fire-once per target and the
 * haptic toggle stay in `journey-decisions.ts`; this adapter only names the
 * stable finale target. Motion and haptics stay independently controlled
 * per the seam.
 */
import {
  shouldFireHaptic,
  type HapticCue,
  type JourneyPreferences,
} from './journey-decisions';

/** Stable finale haptic target so the hearts bloom fires exactly once. */
export function getFinaleHapticTarget(): string {
  return 'finale-hearts';
}

/**
 * Decides which Haptic Cue the Finale may fire now, or null to stay silent.
 * The hearts bloom lands medium; already-fired targets and a muted toggle
 * stay silent.
 */
export function shouldFireFinaleHaptic(
  firedTargetIds: readonly string[],
  preferences: JourneyPreferences,
): HapticCue | null {
  if (!shouldFireHaptic(getFinaleHapticTarget(), firedTargetIds, preferences)) {
    return null;
  }
  return 'medium';
}
