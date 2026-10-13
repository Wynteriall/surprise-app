import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import {
  getInitialHeroStage,
  getNextHeroStage,
  type HapticCue,
  type HeroStage,
  type JourneyPreferences,
} from './journey-decisions';
import { getHeroHapticTarget, shouldFireHeroStageHaptic } from './hero-haptics';

/** Injectable Haptic Cue driver so tests can record cues without native modules. */
export type HeroHapticDriver = (cue: HapticCue) => void;

/** Production driver: staged ticks plus medium at bloom via expo-haptics. */
export function expoHeroHapticDriver(cue: HapticCue): void {
  const style =
    cue === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
  void Haptics.impactAsync(style);
}

/**
 * Per-stage dwell before auto-advance. Timing is a UI concern; the order of
 * stages always comes from `getNextHeroStage` in the seam, never from this map.
 */
const STAGE_DWELL_MS: Record<HeroStage, number> = {
  'gate-in': 0,
  'gate-out': 450,
  seed: 750,
  bud: 900,
  stems: 1100,
  flower: 900,
  bloom: 0,
};

export interface HeroSequence {
  /** Current Bloom Sequence stage, decided by the seam. */
  stage: HeroStage;
  /**
   * Whether the sequence has reached a stage via seam transitions.
   * Visibility derives from travelled stages, never from hardcoded order.
   */
  hasReachedStage: (target: HeroStage) => boolean;
  /** Tap handler for the Click Me gate; ignored once the gate is gone. */
  handleGatePress: () => void;
}

interface FiredEntry {
  prefs: JourneyPreferences;
  ids: Set<string>;
}

/**
 * Drives the gated Tulip Hero Bloom Sequence through the journey-decision
 * seam. Opens at the Click Me gate (or the static bloom under reduced
 * motion), advances stage by stage via `getNextHeroStage`, and fires each
 * staged Haptic Cue once via `shouldFireHeroStageHaptic` at the moment a
 * stage is entered. Cues fire from event and timer callbacks with a
 * synchronous guard, so each stage ticks exactly once even under double
 * effects; reduced motion and a muted toggle stay silent through the seam.
 */
export function useHeroSequence(
  preferences: JourneyPreferences,
  hapticDriver: HeroHapticDriver = expoHeroHapticDriver,
): HeroSequence {
  const prefs = useMemo<JourneyPreferences>(
    () => ({
      hapticsEnabled: preferences.hapticsEnabled,
      reducedMotion: preferences.reducedMotion,
    }),
    [preferences.hapticsEnabled, preferences.reducedMotion],
  );
  const [sequence, setSequence] = useState(() => {
    const initial = getInitialHeroStage(prefs);
    return { prefs, stage: initial, visited: [initial] };
  });
  if (sequence.prefs !== prefs) {
    const initial = getInitialHeroStage(prefs);
    setSequence({ prefs, stage: initial, visited: [initial] });
  }
  const { stage } = sequence;

  const firedRef = useRef<FiredEntry | null>(null);

  const fireForStage = useCallback(
    (
      target: HeroStage,
      current: JourneyPreferences,
      driver: HeroHapticDriver,
    ) => {
      let entry = firedRef.current;
      if (entry === null || entry.prefs !== current) {
        entry = { prefs: current, ids: new Set<string>() };
        firedRef.current = entry;
      }
      const cue = shouldFireHeroStageHaptic(target, [...entry.ids], current);
      if (cue === null) {
        return;
      }
      entry.ids.add(getHeroHapticTarget(target));
      driver(cue);
    },
    [],
  );

  useEffect(() => {
    if (prefs.reducedMotion) {
      return;
    }
    if (stage === 'gate-in' || stage === 'bloom') {
      return;
    }
    const next = getNextHeroStage(stage);
    if (next === null) {
      return;
    }
    const timer = setTimeout(() => {
      fireForStage(next, prefs, hapticDriver);
      setSequence((current) =>
        current.stage === stage
          ? {
              prefs: current.prefs,
              stage: next,
              visited: current.visited.includes(next)
                ? current.visited
                : [...current.visited, next],
            }
          : current,
      );
    }, STAGE_DWELL_MS[stage]);
    return () => {
      clearTimeout(timer);
    };
  }, [stage, prefs, hapticDriver, fireForStage]);

  const handleGatePress = useCallback(() => {
    if (sequence.stage !== 'gate-in') {
      return;
    }
    const next = getNextHeroStage(sequence.stage) ?? sequence.stage;
    fireForStage(next, prefs, hapticDriver);
    setSequence((current) =>
      current.stage === 'gate-in'
        ? {
            prefs: current.prefs,
            stage: next,
            visited: [...current.visited, next],
          }
        : current,
    );
  }, [sequence.stage, prefs, hapticDriver, fireForStage]);

  const hasReachedStage = useCallback(
    (target: HeroStage) => sequence.visited.includes(target),
    [sequence.visited],
  );

  return { stage, hasReachedStage, handleGatePress };
}
