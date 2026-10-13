/**
 * Story Beat block Haptic Cues, decided through the journey-decision seam.
 *
 * The Beat UI asks this adapter (never the fire-once rules directly) which
 * cue a Beat Block may fire. Block-to-cue mapping, fire-once per target, and
 * the haptic toggle all stay in `journey-decisions.ts`; this adapter only
 * maps per-block haptic props to cues and names the per-block target.
 * Motion and haptics stay independently controlled per the seam.
 */
import {
  shouldFireHaptic,
  type BeatBlock,
  type HapticCue,
  type JourneyPreferences,
} from './journey-decisions';

/** Stable per-block haptic target so each block fires independently once. */
export function getBeatBlockHapticTarget(
  beatId: string,
  index: number,
): string {
  return `beat-${beatId}-block-${index}`;
}

/**
 * Maps a Beat Block's haptic prop to its staged cue.
 * Reveal-text Snippets tick light, float-photos pop medium, decorative
 * blocks (drawn-line, glow-spacer) and muted blocks stay silent.
 */
export function getBeatBlockHaptic(block: BeatBlock): HapticCue | null {
  switch (block.kind) {
    case 'reveal-text':
      return block.haptic === 'light' ? 'light' : null;
    case 'float-photo':
      return block.haptic === 'medium' ? 'medium' : null;
    case 'drawn-line':
    case 'glow-spacer':
      return null;
  }
}

/**
 * Decides which Haptic Cue a Beat Block may fire now, or null to stay
 * silent. Returns null for decorative or muted blocks, already-fired
 * targets, and a muted toggle.
 */
export function shouldFireBeatBlockHaptic(
  block: BeatBlock,
  beatId: string,
  index: number,
  firedTargetIds: readonly string[],
  preferences: JourneyPreferences,
): HapticCue | null {
  const cue = getBeatBlockHaptic(block);
  if (cue === null) {
    return null;
  }
  if (
    !shouldFireHaptic(
      getBeatBlockHapticTarget(beatId, index),
      firedTargetIds,
      preferences,
    )
  ) {
    return null;
  }
  return cue;
}
