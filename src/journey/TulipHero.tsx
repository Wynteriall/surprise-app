import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { journeyTheme } from '@/src/theme/tokens';
import type { JourneyPreferences } from './journey-decisions';
import {
  expoHeroHapticDriver,
  useHeroSequence,
  type HeroHapticDriver,
} from './useHeroSequence';

const ART_VIEWBOX = '0 0 200 340';

/** Shared SVG shell so every botanical layer draws on the same coordinates. */
function HeroArt({ children }: { children: ReactNode }) {
  return (
    <Svg viewBox={ART_VIEWBOX} style={styles.art}>
      {children}
    </Svg>
  );
}

interface HeroLayerProps {
  testID: string;
  visible: boolean;
  delay?: number;
  fromScale?: number;
  fromY?: number;
  toY?: number;
  children: ReactNode;
}

/**
 * One animated Tulip Hero layer. Transform and opacity only: the wrapper
 * fades, scales, or slides while the SVG art inside stays static.
 */
function HeroLayer({
  testID,
  visible,
  delay = 0,
  fromScale = 1,
  fromY = 0,
  toY = 0,
  children,
}: HeroLayerProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(fromScale);
  const translateY = useSharedValue(fromY);

  useEffect(() => {
    if (visible) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 550 }));
      scale.value = withDelay(
        delay,
        withSpring(1, { damping: 13, stiffness: 120 }),
      );
      translateY.value = withDelay(delay, withTiming(toY, { duration: 600 }));
    } else {
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, delay, toY, opacity, scale, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View
      testID={testID}
      style={[styles.layer, style]}
      pointerEvents="none"
    >
      {children}
    </Animated.View>
  );
}

function HeroBackdrop() {
  return (
    <View style={styles.layer} pointerEvents="none">
      <HeroArt>
        <Defs>
          <LinearGradient id="heroBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="1" />
            <Stop offset="0.55" stopColor="#160b12" stopOpacity="1" />
            <Stop offset="1" stopColor="#0a0608" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="200" height="340" fill="url(#heroBg)" />
        <Ellipse
          cx="100"
          cy="170"
          rx="92"
          ry="72"
          fill={journeyTheme.colors.glow}
          opacity="0.12"
        />
      </HeroArt>
    </View>
  );
}

function SeedArt() {
  return (
    <HeroArt>
      <Ellipse
        cx="100"
        cy="40"
        rx="7"
        ry="9"
        fill={journeyTheme.colors.textRose}
      />
    </HeroArt>
  );
}

function BudArt() {
  return (
    <HeroArt>
      <Path
        d="M100 178 C 112 194, 112 210, 100 222 C 88 210, 88 194, 100 178 Z"
        fill={journeyTheme.colors.leaf}
      />
    </HeroArt>
  );
}

function StemsArt() {
  return (
    <HeroArt>
      <Path
        d="M100 210 L100 302"
        stroke={journeyTheme.colors.leaf}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M100 250 C 78 246, 66 232, 62 214 C 82 218, 96 230, 100 250 Z"
        fill={journeyTheme.colors.leaf}
        opacity="0.9"
      />
      <Path
        d="M100 268 C 122 264, 134 250, 138 232 C 118 236, 104 248, 100 268 Z"
        fill={journeyTheme.colors.leaf}
        opacity="0.9"
      />
      <Path
        d="M100 302 C 92 312, 82 318, 72 320"
        stroke={journeyTheme.colors.textRose}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <Path
        d="M100 302 C 100 312, 100 320, 100 328"
        stroke={journeyTheme.colors.textRose}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <Path
        d="M100 302 C 108 312, 118 318, 128 320"
        stroke={journeyTheme.colors.textRose}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </HeroArt>
  );
}

function FlowerArt() {
  return (
    <HeroArt>
      <Path
        d="M100 128 C 112 144, 114 164, 100 182 C 86 164, 88 144, 100 128 Z"
        fill={journeyTheme.colors.tulip}
      />
      <Path
        d="M84 140 C 90 158, 88 174, 78 186 C 70 168, 72 150, 84 140 Z"
        fill={journeyTheme.colors.textRose}
        opacity="0.9"
      />
      <Path
        d="M116 140 C 110 158, 112 174, 122 186 C 130 168, 128 150, 116 140 Z"
        fill={journeyTheme.colors.textRose}
        opacity="0.9"
      />
    </HeroArt>
  );
}

function BloomArt() {
  return (
    <HeroArt>
      <Ellipse
        cx="100"
        cy="158"
        rx="58"
        ry="52"
        fill={journeyTheme.colors.glow}
        opacity="0.35"
      />
      <Path
        d="M100 118 C 116 138, 118 164, 100 186 C 82 164, 84 138, 100 118 Z"
        fill={journeyTheme.colors.tulip}
      />
      <Path
        d="M76 132 C 84 154, 82 176, 68 192 C 58 170, 62 146, 76 132 Z"
        fill={journeyTheme.colors.glow}
        opacity="0.95"
      />
      <Path
        d="M124 132 C 116 154, 118 176, 132 192 C 142 170, 138 146, 124 132 Z"
        fill={journeyTheme.colors.glow}
        opacity="0.95"
      />
    </HeroArt>
  );
}

function DrawnLineArt({ d, stroke }: { d: string; stroke: string }) {
  return (
    <HeroArt>
      <Path
        d={d}
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </HeroArt>
  );
}

interface DrawnLineSpec {
  id: string;
  d: string;
  stroke: string;
  delay: number;
}

const DRAWN_LINES: DrawnLineSpec[] = [
  {
    id: 'hero-line-1',
    d: 'M28 262 C 70 256, 130 256, 172 262',
    stroke: journeyTheme.colors.textRose,
    delay: 200,
  },
  {
    id: 'hero-line-2',
    d: 'M44 278 C 80 273, 120 273, 156 278',
    stroke: journeyTheme.colors.glow,
    delay: 380,
  },
  {
    id: 'hero-line-3',
    d: 'M62 294 C 88 290, 112 290, 138 294',
    stroke: journeyTheme.colors.textRose,
    delay: 560,
  },
];

export interface TulipHeroProps {
  preferences: JourneyPreferences;
  hapticDriver?: HeroHapticDriver;
}

/**
 * The full plant composition shared by both branches: the static reduced
 * motion bloom and the animated layers each wrap one entry.
 */
const PLANT_ART: { key: string; node: ReactNode }[] = [
  { key: 'bud', node: <BudArt /> },
  { key: 'stems', node: <StemsArt /> },
  { key: 'flower', node: <FlowerArt /> },
  { key: 'bloom', node: <BloomArt /> },
];

/**
 * Gated Tulip Hero running the seed-to-bloom sequence with staged Haptic
 * Cues. Stage order, cue mapping, and fire-once all come from the
 * journey-decision seam via `useHeroSequence`; this component only maps
 * stages to SVG plus Reanimated layers (transform and opacity only, no Skia,
 * no image). Reduced motion renders a static bloom with no staged ticks.
 */
export function TulipHero({
  preferences,
  hapticDriver = expoHeroHapticDriver,
}: TulipHeroProps) {
  const { stage, hasReachedStage, handleGatePress } = useHeroSequence(
    preferences,
    hapticDriver,
  );

  const gateOpacity = useSharedValue(0);
  useEffect(() => {
    gateOpacity.value = withTiming(stage === 'gate-in' ? 1 : 0, {
      duration: stage === 'gate-in' ? 600 : 250,
    });
  }, [stage, gateOpacity]);
  const gateStyle = useAnimatedStyle(() => ({
    opacity: gateOpacity.value,
  }));

  if (preferences.reducedMotion) {
    return (
      <View
        testID="tulip-hero"
        style={styles.stage}
        accessible
        accessibilityLabel="Tulip in full bloom"
      >
        <View testID="tulip-static-bloom" style={styles.stack}>
          <HeroBackdrop />
          {PLANT_ART.map((entry) => (
            <View key={entry.key} style={styles.layer} pointerEvents="none">
              {entry.node}
            </View>
          ))}
          {DRAWN_LINES.map((line) => (
            <View
              key={line.id}
              testID={line.id}
              style={styles.layer}
              pointerEvents="none"
            >
              <DrawnLineArt d={line.d} stroke={line.stroke} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const gateVisible = stage === 'gate-in' || stage === 'gate-out';
  const seedVisible = stage === 'seed';
  const budVisible = hasReachedStage('bud');
  const stemsVisible = hasReachedStage('stems');
  const flowerVisible = hasReachedStage('flower');
  const bloomVisible = stage === 'bloom';

  return (
    <View testID="tulip-hero" style={styles.stage}>
      <View style={styles.stack}>
        <HeroBackdrop />
        <HeroLayer
          testID="hero-seed"
          visible={seedVisible}
          fromScale={0.3}
          fromY={0}
          toY={168}
        >
          <SeedArt />
        </HeroLayer>
        <HeroLayer
          testID="hero-bud"
          visible={budVisible}
          fromScale={0.2}
          toY={flowerVisible ? 26 : 0}
        >
          <BudArt />
        </HeroLayer>
        <HeroLayer testID="hero-stems" visible={stemsVisible} fromScale={0.6}>
          <StemsArt />
        </HeroLayer>
        <HeroLayer
          testID="hero-flower"
          visible={flowerVisible}
          fromScale={0.2}
          fromY={12}
        >
          <FlowerArt />
        </HeroLayer>
        <HeroLayer
          testID="hero-bloom"
          visible={bloomVisible}
          fromScale={0.7}
          delay={150}
        >
          <BloomArt />
        </HeroLayer>
        {DRAWN_LINES.map((line) => (
          <HeroLayer
            key={line.id}
            testID={line.id}
            visible={bloomVisible}
            fromY={10}
            delay={line.delay}
          >
            <DrawnLineArt d={line.d} stroke={line.stroke} />
          </HeroLayer>
        ))}
        {gateVisible ? (
          <Animated.View testID="hero-gate" style={[styles.gate, gateStyle]}>
            <Pressable
              testID="hero-gate-press"
              accessibilityRole="button"
              accessibilityLabel="Click Me to start the bloom"
              onPress={handleGatePress}
              style={styles.gateButton}
            >
              <Text style={styles.gateText}>Click Me</Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    backgroundColor: journeyTheme.colors.background,
    minHeight: 560,
    padding: journeyTheme.spacing.sectionPadding,
  },
  stack: {
    flex: 1,
    minHeight: 512,
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    width: 200,
    height: 340,
  },
  gate: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateButton: {
    borderColor: journeyTheme.colors.textRose,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  gateText: {
    color: journeyTheme.colors.textPrimary,
    fontSize: 17,
  },
});
