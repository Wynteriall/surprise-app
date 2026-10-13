import { useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import {
  shouldRevealBeat,
  shouldRevealInstantly,
  type HapticCue,
  type JourneyPreferences,
  type StoryBeat,
} from './journey-decisions';
import {
  getBeatBlockHapticTarget,
  shouldFireBeatBlockHaptic,
} from './beat-haptics';

/** Injectable Haptic Cue driver so tests can record cues without native modules. */
export type BeatHapticDriver = (cue: HapticCue) => void;

/** Production driver: light tick on reveal, medium pop on photos. */
export function expoBeatHapticDriver(cue: HapticCue): void {
  const style =
    cue === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
  void Haptics.impactAsync(style);
}

export interface BeatReveal {
  /** Whether the Story Beat has revealed via the seam (reveal-once). */
  revealed: boolean;
  /** Whether the Story Beat reveals instantly with no parallax. */
  instant: boolean;
}

/**
 * Drives one Story Beat reveal through the journey-decision seam. The beat
 * reveals once when it enters view (or instantly under reduced motion), and
 * each Beat Block Haptic Cue fires once in block order once revealed.
 * Reveal-once, fire-once, the haptic toggle, and the instant path all come
 * from the seam; this hook only holds the revealed identities and the
 * fired-target set. The reveal commits during render (mirroring
 * `useHeroSequence`'s prefs sync) while cues fire from an effect with a
 * synchronous guard, so each block ticks exactly once even under double
 * effects.
 */
export function useBeatReveal(
  beat: StoryBeat,
  isInView: boolean,
  preferences: JourneyPreferences,
  hapticDriver: BeatHapticDriver = expoBeatHapticDriver,
): BeatReveal {
  const prefs = useMemo<JourneyPreferences>(
    () => ({
      hapticsEnabled: preferences.hapticsEnabled,
      reducedMotion: preferences.reducedMotion,
    }),
    [preferences.hapticsEnabled, preferences.reducedMotion],
  );
  const instant = shouldRevealInstantly(prefs);
  const [revealedIds, setRevealedIds] = useState<readonly string[]>(() =>
    shouldRevealBeat(beat.id, [], false, prefs) ? [beat.id] : [],
  );
  if (
    !revealedIds.includes(beat.id) &&
    shouldRevealBeat(beat.id, revealedIds, isInView, prefs)
  ) {
    setRevealedIds([...revealedIds, beat.id]);
  }
  const revealed = revealedIds.includes(beat.id);

  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!revealed) {
      return;
    }
    const fired = firedRef.current;
    beat.blocks.forEach((block, index) => {
      const cue = shouldFireBeatBlockHaptic(
        block,
        beat.id,
        index,
        [...fired],
        prefs,
      );
      if (cue === null) {
        return;
      }
      fired.add(getBeatBlockHapticTarget(beat.id, index));
      hapticDriver(cue);
    });
  }, [beat, prefs, revealed, hapticDriver]);

  return { revealed, instant };
}
