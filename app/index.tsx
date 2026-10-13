import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { ScrollJourney } from '@/src/journey/ScrollJourney';

/**
 * The single Scroll Journey route: Tulip Hero through five Story Beats to
 * the hearts-bloom Finale. The route only owns viewer inputs (reduced
 * motion from the OS, the haptic toggle); reveal-once, fire-once, and the
 * instant paths all live in the journey-decision seam via the section hooks.
 */
export default function JourneyIndex() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setReducedMotion(enabled);
        }
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted) {
          setReducedMotion(enabled);
        }
      },
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const preferences = useMemo(
    () => ({ hapticsEnabled, reducedMotion }),
    [hapticsEnabled, reducedMotion],
  );

  return (
    <ScrollJourney
      preferences={preferences}
      onHapticsChange={setHapticsEnabled}
    />
  );
}
