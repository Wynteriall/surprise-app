import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { journeyTheme } from '@/src/theme/tokens';
import type { BeatBlock } from './journey-decisions';
import { resolveBeatPhotoAsset } from './beat-photos';

type RevealTextBlock = Extract<BeatBlock, { kind: 'reveal-text' }>;
type FloatPhotoBlock = Extract<BeatBlock, { kind: 'float-photo' }>;

interface BlockAnimationProps {
  /** Whether the parent Story Beat has revealed through the seam. */
  revealed: boolean;
  /** Stagger delay from the Beat composer, zero when revealing instantly. */
  delay: number;
  /** Reduced-motion path: reveal instantly with no parallax. */
  instant: boolean;
}

/**
 * Reveal-text Snippet: one or two lines fading or rising in on scroll.
 * Transform and opacity only; the wrapper carries the revealed-state testID
 * so behavior tests never assert animation frames.
 */
export function RevealText({
  block,
  revealed,
  delay,
  instant,
}: BlockAnimationProps & { block: RevealTextBlock }) {
  const variant = instant ? 'instant' : block.animation;
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(variant === 'rise' ? 14 : 0);

  useEffect(() => {
    if (!revealed) {
      opacity.value = 0;
      translateY.value = variant === 'rise' ? 14 : 0;
      return;
    }
    if (instant) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500 }));
  }, [revealed, delay, instant, variant, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      testID={revealed ? `beat-text-${variant}` : 'beat-text-hidden'}
      style={[styles.textWrap, style]}
      accessible
      accessibilityLabel={block.text}
      accessibilityElementsHidden={!revealed}
    >
      <Animated.Text style={styles.snippet}>{block.text}</Animated.Text>
    </Animated.View>
  );
}

/**
 * Float-photo Beat Block: at most one small local photo per Story Beat,
 * popping or drifting in on scroll. A missing asset degrades to a labeled
 * SVG placeholder instead of crashing; photos are local-only, never remote.
 * Transform and opacity only; parallax here is a translateY entrance, and
 * scroll-linked parallax offset wires in with the full journey assembly.
 */
export function FloatPhoto({
  block,
  revealed,
  delay,
  instant,
}: BlockAnimationProps & { block: FloatPhotoBlock }) {
  const variant = instant ? 'instant' : block.animation;
  const source = resolveBeatPhotoAsset(block.asset);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(variant === 'pop' ? 0.6 : 1);
  const translateY = useSharedValue(variant === 'parallax' ? 26 : 0);

  useEffect(() => {
    if (!revealed) {
      opacity.value = 0;
      scale.value = variant === 'pop' ? 0.6 : 1;
      translateY.value = variant === 'parallax' ? 26 : 0;
      return;
    }
    if (instant) {
      opacity.value = 1;
      scale.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    if (variant === 'pop') {
      scale.value = withDelay(
        delay,
        withSpring(1, { damping: 12, stiffness: 140 }),
      );
      translateY.value = 0;
    } else {
      translateY.value = withDelay(delay, withTiming(0, { duration: 550 }));
    }
  }, [revealed, delay, instant, variant, opacity, scale, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View
      testID={revealed ? `beat-photo-${variant}` : 'beat-photo-hidden'}
      style={[styles.photoWrap, style]}
    >
      {source !== null ? (
        <Image
          source={source}
          testID="beat-photo-image"
          accessibilityLabel={block.alt}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : (
        <View
          testID="beat-photo-placeholder"
          accessible
          accessibilityLabel={block.alt}
          style={styles.placeholder}
        >
          <Svg viewBox="0 0 168 120" style={styles.placeholderArt}>
            <Ellipse
              cx="84"
              cy="60"
              rx="52"
              ry="38"
              fill={journeyTheme.colors.glow}
              opacity="0.22"
            />
          </Svg>
        </View>
      )}
    </Animated.View>
  );
}

interface AccentProps {
  revealed: boolean;
  delay: number;
}

/**
 * Drawn-line accent: a small SVG flourish fading in with the beat.
 * Transform and opacity only, decorative with no Haptic Cue.
 */
export function DrawnLine({ revealed, delay }: AccentProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    if (revealed) {
      opacity.value = withDelay(delay, withTiming(0.8, { duration: 500 }));
      translateY.value = withDelay(delay, withTiming(0, { duration: 500 }));
    } else {
      opacity.value = 0;
      translateY.value = 8;
    }
  }, [revealed, delay, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      testID="beat-drawn-line"
      style={[styles.lineWrap, style]}
      pointerEvents="none"
    >
      <Svg viewBox="0 0 200 24" style={styles.lineArt}>
        <Path
          d="M12 13 C 60 7, 140 19, 188 11"
          stroke={journeyTheme.colors.textRose}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * Glow-spacer accent: calm breathing room with a soft glow, no animation
 * and no Haptic Cue.
 */
export function GlowSpacer() {
  return (
    <View testID="beat-glow-spacer" style={styles.spacer} pointerEvents="none">
      <Svg viewBox="0 0 200 48" style={styles.spacerArt}>
        <Ellipse
          cx="100"
          cy="24"
          rx="70"
          ry="16"
          fill={journeyTheme.colors.glow}
          opacity="0.18"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  textWrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 8,
  },
  snippet: {
    color: journeyTheme.colors.textPrimary,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
  },
  photoWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  photo: {
    borderRadius: 16,
    height: 120,
    width: 168,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: journeyTheme.colors.surface,
    borderColor: journeyTheme.colors.textRose,
    borderRadius: 16,
    borderWidth: 1,
    height: 120,
    justifyContent: 'center',
    width: 168,
  },
  placeholderArt: {
    height: 120,
    width: 168,
  },
  lineWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  lineArt: {
    height: 24,
    width: 200,
  },
  spacer: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
  },
  spacerArt: {
    height: 48,
    width: 200,
  },
});
