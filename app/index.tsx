import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { TulipHero } from '@/src/journey/TulipHero';
import { StoryBeatView } from '@/src/journey/StoryBeatView';
import { PLACEHOLDER_BEATS } from '@/src/journey/placeholder-beats';
import { journeyTheme } from '@/src/theme/tokens';

/**
 * One sample Story Beat demoing the Beat Block primitives below the hero.
 * Full five-beat assembly plus the haptic toggle UI arrive in ticket 05.
 */
const SAMPLE_BEAT = PLACEHOLDER_BEATS.find((beat) => beat.id === 'small-habit');

/**
 * The single Scroll Journey route.
 * Ticket 04: the gated Tulip Hero opens the journey, followed by one sample
 * Story Beat revealing on scroll with staged Haptic Cues.
 */
export default function JourneyIndex() {
  const [reducedMotion, setReducedMotion] = useState(false);
  // Haptic toggle input, default on; the toggle UI itself arrives in ticket 05.
  const [hapticsEnabled] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [beatY, setBeatY] = useState<number | null>(null);

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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  };

  const handleBeatLayout = (event: LayoutChangeEvent) => {
    setBeatY(event.nativeEvent.layout.y);
  };

  const beatInView =
    beatY !== null &&
    viewportHeight > 0 &&
    beatY - scrollY < viewportHeight * 0.8;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      testID="scroll-journey"
      scrollEventThrottle={16}
      onScroll={handleScroll}
      onLayout={handleViewportLayout}
    >
      <TulipHero preferences={{ hapticsEnabled, reducedMotion }} />
      {SAMPLE_BEAT ? (
        <View onLayout={handleBeatLayout}>
          <StoryBeatView
            beat={SAMPLE_BEAT}
            preferences={{ hapticsEnabled, reducedMotion }}
            isInView={beatInView}
          />
        </View>
      ) : null}
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
