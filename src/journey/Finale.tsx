import { memo, useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { journeyTheme } from '@/src/theme/tokens';
import type { JourneyPreferences } from './journey-decisions';
import {
  expoFinaleHapticDriver,
  useFinaleReveal,
  type FinaleHapticDriver,
} from './useFinaleReveal';

/** Short closing note, never a summary or credits roll. */
export const FINALE_NOTE = 'You are my favorite hello.';

export interface FinaleProps {
  preferences: JourneyPreferences;
  hapticDriver?: FinaleHapticDriver;
  /** Whether the Finale has scrolled into view; the seam decides reveal. */
  isInView?: boolean;
}

interface HeartsLayerProps {
  delay?: number;
  fromScale?: number;
  fromY?: number;
  children: ReactNode;
}

/**
 * One animated hearts-bloom layer. Transform and opacity only: the wrapper
 * fades, scales, or rises while the SVG art inside stays static.
 */
function HeartsLayer({
  delay = 0,
  fromScale = 0.6,
  fromY = 10,
  children,
}: HeartsLayerProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(fromScale);
  const translateY = useSharedValue(fromY);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 140 }),
    );
    translateY.value = withDelay(delay, withTiming(0, { duration: 500 }));
  }, [delay, opacity, scale, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.heart, style]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}

function HeartsArt() {
  return (
    <Svg viewBox="0 0 200 140" style={styles.heartsArt}>
      <Ellipse
        cx="100"
        cy="70"
        rx="72"
        ry="46"
        fill={journeyTheme.colors.glow}
        opacity="0.2"
      />
      <Path
        d="M100 96 C 88 82, 66 68, 66 50 C 66 38, 80 34, 90 42 C 95 46, 98 50, 100 54 C 102 50, 105 46, 110 42 C 120 34, 134 38, 134 50 C 134 68, 112 82, 100 96 Z"
        fill={journeyTheme.colors.tulip}
      />
      <Path
        d="M52 66 C 46 58, 34 52, 34 42 C 34 35, 42 32, 47 36 C 50 38, 51 40, 52 42 C 53 40, 54 38, 57 36 C 62 32, 70 35, 70 42 C 70 52, 58 58, 52 66 Z"
        fill={journeyTheme.colors.glow}
        opacity="0.95"
      />
      <Path
        d="M148 66 C 142 58, 130 52, 130 42 C 130 35, 138 32, 143 36 C 146 38, 147 40, 148 42 C 149 40, 150 38, 153 36 C 158 32, 166 35, 166 42 C 166 52, 154 58, 148 66 Z"
        fill={journeyTheme.colors.textRose}
        opacity="0.95"
      />
    </Svg>
  );
}

/**
 * The closing Journey Section: a short note plus a code-drawn hearts bloom
 * with one medium Haptic Cue. Reveal-once, fire-once, and the instant path
 * come from the journey-decision seam via `useFinaleReveal`; this component
 * only maps reveal to SVG plus Reanimated layers (transform and opacity
 * only, no Skia, no image). Reduced motion renders a static finale with no
 * staged motion. Magical accents live only here and in the Tulip Hero.
 */
export const Finale = memo(function Finale({
  preferences,
  hapticDriver = expoFinaleHapticDriver,
  isInView = false,
}: FinaleProps) {
  const { revealed } = useFinaleReveal(isInView, preferences, hapticDriver);

  const noteOpacity = useSharedValue(0);
  const noteY = useSharedValue(12);
  useEffect(() => {
    if (revealed) {
      noteOpacity.value = withTiming(1, { duration: 500 });
      noteY.value = withTiming(0, { duration: 500 });
    } else {
      noteOpacity.value = 0;
      noteY.value = 12;
    }
  }, [revealed, noteOpacity, noteY]);
  const noteStyle = useAnimatedStyle(() => ({
    opacity: noteOpacity.value,
    transform: [{ translateY: noteY.value }],
  }));

  if (preferences.reducedMotion) {
    return (
      <View
        testID="finale"
        style={styles.finale}
        accessible
        accessibilityLabel="Finale"
      >
        <View style={styles.noteWrap}>
          <Text testID="finale-note" style={styles.note}>
            {FINALE_NOTE}
          </Text>
        </View>
        <View testID="finale-static" style={styles.heartsWrap}>
          <HeartsArt />
        </View>
      </View>
    );
  }

  return (
    <View
      testID="finale"
      style={styles.finale}
      accessible
      accessibilityLabel="Finale"
    >
      <Animated.View style={[styles.noteWrap, noteStyle]}>
        <Text testID="finale-note" style={styles.note}>
          {FINALE_NOTE}
        </Text>
      </Animated.View>
      {revealed ? (
        <View testID="finale-hearts" style={styles.heartsWrap}>
          <HeartsLayer delay={120} fromScale={0.5} fromY={14}>
            <HeartsArt />
          </HeartsLayer>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  finale: {
    alignItems: 'center',
    backgroundColor: journeyTheme.colors.background,
    paddingHorizontal: journeyTheme.spacing.sectionPadding,
    paddingVertical: journeyTheme.spacing.beatGap,
  },
  noteWrap: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  note: {
    color: journeyTheme.colors.textPrimary,
    fontSize: 19,
    lineHeight: 28,
    textAlign: 'center',
  },
  heartsWrap: {
    alignItems: 'center',
    minHeight: 140,
  },
  heart: {
    alignItems: 'center',
  },
  heartsArt: {
    height: 140,
    width: 200,
  },
});
