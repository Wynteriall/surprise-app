import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { journeyTheme } from '@/src/theme/tokens';
import type { HapticCue, JourneyPreferences } from './journey-decisions';
import { PLACEHOLDER_BEATS } from './placeholder-beats';
import { TulipHero } from './TulipHero';
import { StoryBeatView } from './StoryBeatView';
import { Finale } from './Finale';
import { HapticToggle } from './HapticToggle';
import { expoBeatHapticDriver } from './useBeatReveal';

/**
 * Visibility threshold: a Journey Section counts as in view once its top
 * sits above 80% of the viewport. Timing/layout is a UI concern; reveal-once
 * itself stays in the seam via the section hooks.
 */
const IN_VIEW_RATIO = 0.8;

export interface ScrollJourneyProps {
  preferences: JourneyPreferences;
  /** Single cue recorder driving hero, beats, and finale in tests. */
  hapticDriver?: (cue: HapticCue) => void;
  /** Notifies the route when the viewer flips the haptic toggle. */
  onHapticsChange: (enabled: boolean) => void;
}

/**
 * The full Scroll Journey: gated Tulip Hero, all five placeholder Story
 * Beats, then the hearts-bloom Finale, with a small calm haptic toggle.
 * Section order and content validity come from the placeholder data plus the
 * seam (never re-encoded here); staged cues fire once per target through
 * the section hooks, muted together by the toggle.
 *
 * Performance: the journey scroll offset lives in a Reanimated shared value
 * (no React state per frame) driving the parallax photo drift via transform
 * only. Scroll events only commit `visibleIds` when a new section enters
 * view, and beats stay memoized, so scrolling holds 60fps with no per-frame
 * React state storms. Reduced motion stays instant throughout via the seam
 * (static hero bloom, instant beat reveals with no parallax, static finale).
 */
export const ScrollJourney = memo(function ScrollJourney({
  preferences,
  hapticDriver = expoBeatHapticDriver,
  onHapticsChange,
}: ScrollJourneyProps) {
  const scrollY = useSharedValue(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [layouts, setLayouts] = useState<Record<string, number>>({});
  const [visibleIds, setVisibleIds] = useState<readonly string[]>([]);
  const lastScrollRef = useRef(0);

  const markVisible = useCallback(
    (
      scrollTop: number,
      viewport: number,
      layoutMap: Record<string, number>,
    ) => {
      if (viewport <= 0) {
        return;
      }
      const threshold = viewport * IN_VIEW_RATIO;
      const entered = Object.entries(layoutMap)
        .filter(([, y]) => y - scrollTop < threshold)
        .map(([id]) => id);
      if (entered.length === 0) {
        return;
      }
      setVisibleIds((prev) => {
        const fresh = entered.filter((id) => !prev.includes(id));
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });
    },
    [],
  );

  useEffect(() => {
    markVisible(lastScrollRef.current, viewportHeight, layouts);
  }, [viewportHeight, layouts, markVisible]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      scrollY.value = y;
      lastScrollRef.current = y;
      markVisible(y, viewportHeight, layouts);
    },
    [viewportHeight, layouts, markVisible, scrollY],
  );

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  }, []);

  const handleSectionLayout = useCallback(
    (id: string) => (event: LayoutChangeEvent) => {
      const y = event.nativeEvent.layout.y;
      setLayouts((prev) => (prev[id] === y ? prev : { ...prev, [id]: y }));
    },
    [],
  );

  const beatSections = useMemo(
    () =>
      PLACEHOLDER_BEATS.map((beat) => (
        <View
          key={beat.id}
          testID={`journey-section-${beat.id}`}
          onLayout={handleSectionLayout(beat.id)}
        >
          <StoryBeatView
            beat={beat}
            preferences={preferences}
            hapticDriver={hapticDriver}
            isInView={visibleIds.includes(beat.id)}
            scrollY={scrollY}
            anchorY={layouts[beat.id]}
          />
        </View>
      )),
    [
      preferences,
      hapticDriver,
      visibleIds,
      layouts,
      scrollY,
      handleSectionLayout,
    ],
  );

  const finaleInView = visibleIds.includes('finale');

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      testID="scroll-journey"
      scrollEventThrottle={16}
      onScroll={handleScroll}
      onLayout={handleViewportLayout}
    >
      <HapticToggle
        enabled={preferences.hapticsEnabled}
        onChange={onHapticsChange}
      />
      <TulipHero preferences={preferences} hapticDriver={hapticDriver} />
      {beatSections}
      <View
        testID="journey-section-finale"
        onLayout={handleSectionLayout('finale')}
      >
        <Finale
          preferences={preferences}
          hapticDriver={hapticDriver}
          isInView={finaleInView}
        />
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: journeyTheme.colors.background,
  },
  content: {
    flexGrow: 1,
  },
});
