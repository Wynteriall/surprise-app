import { useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import {
  shouldRevealBeat,
  shouldRevealInstantly,
  type HapticCue,
  type JourneyPreferences,
} from './journey-decisions';
import {
  getFinaleHapticTarget,
  shouldFireFinaleHaptic,
} from './finale-haptics';

/** Injectable Haptic Cue driver so tests can record cues without native modules. */
export type FinaleHapticDriver = (cue: HapticCue) => void;

/** Production driver: one medium cue as the hearts bloom lands. */
export function expoFinaleHapticDriver(cue: HapticCue): void {
  const style =
    cue === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
  void Haptics.impactAsync(style);
}

export interface FinaleReveal {
  /** Whether the Finale has revealed via the seam (reveal-once). */
  revealed: boolean;
  /** Whether the Finale reveals instantly with no staged motion. */
  instant: boolean;
}

/** Stable seam identity for the closing Journey Section. */
const FINALE_SECTION_ID = 'finale';

/**
 * Drives the Finale reveal through the journey-decision seam. The Finale
 * reveals once when it enters view (or instantly under reduced motion),
 * and its single medium Haptic Cue fires once when revealed.
 * Reveal-once, fire-once, the haptic toggle, and the instant path all come
 * from the seam; this hook only holds the revealed identity and the
 * fired-target set. The reveal commits during render (mirroring
 * `useBeatReveal`) while the cue fires from an effect with a synchronous
 * guard, so it ticks exactly once even under double effects.
 */
export function useFinaleReveal(
  isInView: boolean,
  preferences: JourneyPreferences,
  hapticDriver: FinaleHapticDriver = expoFinaleHapticDriver,
): FinaleReveal {
  const prefs = useMemo<JourneyPreferences>(
    () => ({
      hapticsEnabled: preferences.hapticsEnabled,
      reducedMotion: preferences.reducedMotion,
    }),
    [preferences.hapticsEnabled, preferences.reducedMotion],
  );
  const instant = shouldRevealInstantly(prefs);
  const [revealedIds, setRevealedIds] = useState<readonly string[]>(() =>
    shouldRevealBeat(FINALE_SECTION_ID, [], false, prefs)
      ? [FINALE_SECTION_ID]
      : [],
  );
  if (
    !revealedIds.includes(FINALE_SECTION_ID) &&
    shouldRevealBeat(FINALE_SECTION_ID, revealedIds, isInView, prefs)
  ) {
    setRevealedIds([...revealedIds, FINALE_SECTION_ID]);
  }
  const revealed = revealedIds.includes(FINALE_SECTION_ID);

  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!revealed) {
      return;
    }
    const fired = firedRef.current;
    const cue = shouldFireFinaleHaptic([...fired], prefs);
    if (cue === null) {
      return;
    }
    fired.add(getFinaleHapticTarget());
    hapticDriver(cue);
  }, [prefs, revealed, hapticDriver]);

  return { revealed, instant };
}
