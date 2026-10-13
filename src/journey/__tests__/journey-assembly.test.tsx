import fs from 'node:fs';
import path from 'node:path';
import { act, type ReactTestRenderer } from 'react-test-renderer';
import { create } from 'react-test-renderer';

import type { HapticCue, JourneyPreferences } from '../journey-decisions';
import { MAX_SNIPPET_LENGTH, validateStoryBeats } from '../journey-decisions';
import { PLACEHOLDER_BEATS } from '../placeholder-beats';
import { ScrollJourney } from '../ScrollJourney';

/**
 * Scroll Journey assembly behavior tests. react-native-reanimated and
 * react-native-svg resolve to the manual mocks in `<root>/__mocks__`;
 * expo-haptics is stubbed below because the injected driver records cues
 * without native modules. Assertions target external behavior (five beats
 * plus finale present, toggle mutes all, reduced motion instant), never
 * animation frames or pixels.
 */
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
}));

const FULL_MOTION: JourneyPreferences = {
  hapticsEnabled: true,
  reducedMotion: false,
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function makeDriver() {
  return jest.fn((_cue: HapticCue) => {});
}

function renderJourney(
  preferences: JourneyPreferences,
  driver: ReturnType<typeof makeDriver>,
  onHapticsChange: (enabled: boolean) => void = () => {},
): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <ScrollJourney
        preferences={preferences}
        hapticDriver={driver}
        onHapticsChange={onHapticsChange}
      />,
    );
  });
  return renderer;
}

function layoutJourney(renderer: ReactTestRenderer): void {
  const scroll = renderer.root.findByProps({ testID: 'scroll-journey' });
  act(() => {
    scroll.props.onLayout?.({
      nativeEvent: { layout: { height: 800 } },
    });
  });
  const ys: Record<string, number> = {
    'first-meet': 600,
    'small-habit': 1100,
    'hard-day-support': 1600,
    'thing-taught': 2100,
    'future-wish': 2600,
    finale: 3100,
  };
  for (const [id, y] of Object.entries(ys)) {
    const section = renderer.root.findByProps({
      testID: `journey-section-${id}`,
    });
    act(() => {
      section.props.onLayout?.({
        nativeEvent: { layout: { y } },
      });
    });
  }
}

function scrollTo(renderer: ReactTestRenderer, y: number): void {
  const scroll = renderer.root.findByProps({ testID: 'scroll-journey' });
  act(() => {
    scroll.props.onScroll?.({
      nativeEvent: { contentOffset: { y } },
    });
  });
}

function revealAll(renderer: ReactTestRenderer): void {
  layoutJourney(renderer);
  scrollTo(renderer, 0);
  scrollTo(renderer, 1200);
  scrollTo(renderer, 3000);
}

describe('Scroll Journey assembly (external behavior)', () => {
  test('Journey scrolls Hero through five placeholder beats to the Finale', () => {
    const renderer = renderJourney(FULL_MOTION, makeDriver());
    expect(renderer.root.findByProps({ testID: 'tulip-hero' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'haptic-toggle' })).toBeTruthy();
    for (const beat of PLACEHOLDER_BEATS) {
      expect(
        renderer.root.findByProps({ testID: `story-beat-${beat.id}` }),
      ).toBeTruthy();
      expect(
        renderer.root.findByProps({ testID: `journey-section-${beat.id}` }),
      ).toBeTruthy();
    }
    expect(validateStoryBeats(PLACEHOLDER_BEATS).valid).toBe(true);
    expect(renderer.root.findByProps({ testID: 'finale' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'finale-note' })).toBeTruthy();
  });

  test('scroll reveals every beat plus the finale hearts bloom', () => {
    const driver = makeDriver();
    const renderer = renderJourney(FULL_MOTION, driver);
    revealAll(renderer);
    expect(
      renderer.root.findAllByProps({ testID: 'beat-text-hidden' }),
    ).toHaveLength(0);
    expect(renderer.root.findByProps({ testID: 'finale-hearts' })).toBeTruthy();
    expect(driver).toHaveBeenCalled();
    expect(driver.mock.calls.map(([cue]) => cue)).toContain('medium');
  });

  test('haptic toggle mutes hero, beat, photo, and finale cues at once', () => {
    const onHapticsChange = jest.fn();
    const enabledDriver = makeDriver();
    const enabled = renderJourney(FULL_MOTION, enabledDriver, onHapticsChange);
    revealAll(enabled);
    act(() => {
      enabled.root.findByProps({ testID: 'hero-gate-press' }).props.onPress();
    });
    expect(enabledDriver).toHaveBeenCalled();
    act(() => {
      enabled.root
        .findByProps({ testID: 'haptic-toggle' })
        .props.onValueChange(false);
    });
    expect(onHapticsChange).toHaveBeenCalledWith(false);

    const mutedDriver = makeDriver();
    const mutedPrefs: JourneyPreferences = {
      hapticsEnabled: false,
      reducedMotion: false,
    };
    const muted = renderJourney(mutedPrefs, mutedDriver, () => {});
    revealAll(muted);
    act(() => {
      muted.root.findByProps({ testID: 'hero-gate-press' }).props.onPress();
    });
    expect(muted.root.findByProps({ testID: 'finale-hearts' })).toBeTruthy();
    expect(mutedDriver).not.toHaveBeenCalled();
  });

  test('reduced motion stays instant throughout with no parallax', () => {
    const renderer = renderJourney(
      { hapticsEnabled: true, reducedMotion: true },
      makeDriver(),
    );
    expect(
      renderer.root.findByProps({ testID: 'tulip-static-bloom' }),
    ).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ testID: 'beat-text-instant' }).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAllByProps({ testID: 'beat-photo-parallax' }),
    ).toHaveLength(0);
    expect(renderer.root.findByProps({ testID: 'finale-static' })).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ testID: 'finale-hearts' }),
    ).toHaveLength(0);
  });

  test('finale note plus every Snippet stays short with at most one photo per beat', () => {
    const renderer = renderJourney(FULL_MOTION, makeDriver());
    revealAll(renderer);
    const note = renderer.root.findByProps({ testID: 'finale-note' });
    const noteText = Array.isArray(note.props.children)
      ? note.props.children.join('')
      : String(note.props.children ?? '');
    expect(noteText.length).toBeLessThanOrEqual(MAX_SNIPPET_LENGTH);
    for (const beat of PLACEHOLDER_BEATS) {
      const section = renderer.root.findByProps({
        testID: `story-beat-${beat.id}`,
      });
      const photos = section.findAll(
        (node) =>
          typeof node.props?.testID === 'string' &&
          (node.props.testID as string).startsWith('beat-photo-') &&
          (node.props.testID as string) !== 'beat-photo-hidden' &&
          (node.props.testID as string) !== 'beat-photo-placeholder',
      );
      const testIDs = new Set(photos.map((node) => node.props.testID));
      expect(testIDs.size).toBeLessThanOrEqual(1);
    }
  });

  test('assembly asks the seam and keeps motion to transform plus opacity', () => {
    // Structural guards, not behavior tests: they lock the ticket's
    // costliest mistakes (re-encoded seam decisions, per-frame state
    // storms, Skia/image art, non-transform animation) out of the
    // assembly. Behavior stays covered by the tests above.
    const sources = [
      '../ScrollJourney.tsx',
      '../../../app/index.tsx',
      '../Finale.tsx',
      '../HapticToggle.tsx',
      '../finale-haptics.ts',
      '../useFinaleReveal.ts',
    ].map((file) => fs.readFileSync(path.join(__dirname, file), 'utf8'));
    for (const source of sources) {
      expect(source).not.toMatch(/react-native-skia|@shopify/i);
      expect(source).not.toMatch(/from\s+['"]expo-image['"]/);
      expect(source).not.toMatch(/https?:\/\//i);
      expect(source).not.toMatch(/setInterval|requestAnimationFrame/i);
    }
    const assembly = fs.readFileSync(
      path.join(__dirname, '../ScrollJourney.tsx'),
      'utf8',
    );
    expect(assembly).not.toMatch(/HERO_STAGE_ORDER/);
    expect(assembly).not.toMatch(/getNextHeroStage|getHeroStageHaptic/);
    expect(assembly).not.toMatch(/shouldRevealBeat|shouldFireHaptic/);
    expect(assembly).not.toMatch(/setScrollY|setBeatY/);
    expect(assembly).toMatch(/useSharedValue/);
    expect(assembly).toMatch(/memo/);
    const route = fs.readFileSync(
      path.join(__dirname, '../../../app/index.tsx'),
      'utf8',
    );
    expect(route).not.toMatch(/setScrollY/);
  });
});
