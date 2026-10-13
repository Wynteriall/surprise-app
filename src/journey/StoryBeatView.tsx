import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { journeyTheme } from '@/src/theme/tokens';
import type {
  BeatBlock,
  JourneyPreferences,
  StoryBeat,
} from './journey-decisions';
import { DrawnLine, FloatPhoto, GlowSpacer, RevealText } from './BeatBlocks';
import {
  expoBeatHapticDriver,
  useBeatReveal,
  type BeatHapticDriver,
} from './useBeatReveal';

/**
 * Stagger between Beat Blocks in reveal order. Timing is a UI concern;
 * reveal-once and reduced-motion instant reveal come from the seam.
 */
const BLOCK_STAGGER_MS = 140;

export interface StoryBeatViewProps {
  beat: StoryBeat;
  preferences: JourneyPreferences;
  hapticDriver?: BeatHapticDriver;
  /** Whether the beat has scrolled into view; the seam decides reveal. */
  isInView?: boolean;
  /** Journey scroll offset for the parallax photo drift, if any. */
  scrollY?: SharedValue<number>;
  /** Beat top offset anchoring the parallax drift, if any. */
  anchorY?: number;
}

interface BeatBlockViewProps {
  block: BeatBlock;
  revealed: boolean;
  delay: number;
  instant: boolean;
  scrollY?: SharedValue<number>;
  anchorY?: number;
}

/** Stacks one Beat Block in the beat's ordered block list. */
function BeatBlockView({
  block,
  revealed,
  delay,
  instant,
  scrollY,
  anchorY,
}: BeatBlockViewProps) {
  switch (block.kind) {
    case 'reveal-text':
      return (
        <RevealText
          block={block}
          revealed={revealed}
          delay={delay}
          instant={instant}
        />
      );
    case 'float-photo':
      return (
        <FloatPhoto
          block={block}
          revealed={revealed}
          delay={delay}
          instant={instant}
          scrollY={scrollY}
          anchorY={anchorY}
        />
      );
    case 'drawn-line':
      return <DrawnLine revealed={revealed} delay={delay} />;
    case 'glow-spacer':
      return <GlowSpacer />;
  }
}

/**
 * One Story Beat: a cherished moment told as an ordered list of small Beat
 * Blocks in any order. Reveal-once, haptic-fire-once, and the instant path
 * come from the journey-decision seam via `useBeatReveal`; this composer
 * only stacks blocks with per-block stagger delay and data-driven haptics.
 * Memoized so the journey scroll holds 60fps: beats re-render only when
 * reveal, preferences, or layout anchors change, never per scroll frame.
 */
export const StoryBeatView = memo(function StoryBeatView({
  beat,
  preferences,
  hapticDriver = expoBeatHapticDriver,
  isInView = false,
  scrollY,
  anchorY,
}: StoryBeatViewProps) {
  const { revealed, instant } = useBeatReveal(
    beat,
    isInView,
    preferences,
    hapticDriver,
  );

  return (
    <View
      testID={`story-beat-${beat.id}`}
      style={styles.beat}
      accessible
      accessibilityLabel={beat.title}
    >
      <Text testID="story-beat-title" style={styles.title}>
        {beat.title}
      </Text>
      {beat.blocks.map((block, index) => (
        <BeatBlockView
          key={`${beat.id}-block-${index}`}
          block={block}
          revealed={revealed}
          delay={instant ? 0 : index * BLOCK_STAGGER_MS}
          instant={instant}
          scrollY={scrollY}
          anchorY={anchorY}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  beat: {
    backgroundColor: journeyTheme.colors.background,
    paddingHorizontal: journeyTheme.spacing.sectionPadding,
    paddingVertical: journeyTheme.spacing.beatGap / 2,
  },
  title: {
    color: journeyTheme.colors.textRose,
    fontSize: 13,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
