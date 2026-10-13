import { useEffect, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet } from 'react-native';

import { TulipHero } from '@/src/journey/TulipHero';
import { journeyTheme } from '@/src/theme/tokens';

/**
 * The single Scroll Journey route.
 * Ticket 03: the gated Tulip Hero opens the journey. Story Beats and Finale
 * arrive in later slices.
 */
export default function JourneyIndex() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setReducedMotion(enabled);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      testID="scroll-journey"
    >
      <TulipHero preferences={{ hapticsEnabled: true, reducedMotion }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: journeyTheme.colors.background,
  },
  content: {
    flexGrow: 1,
  },
});
