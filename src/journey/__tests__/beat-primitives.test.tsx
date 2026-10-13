import fs from 'node:fs';
import path from 'node:path';
import { act, type ReactTestRenderer } from 'react-test-renderer';
import { create } from 'react-test-renderer';

import type {
  HapticCue,
  JourneyPreferences,
  StoryBeat,
} from '../journey-decisions';
import { PLACEHOLDER_BEATS } from '../placeholder-beats';
import { StoryBeatView } from '../StoryBeatView';

/**
 * Beat primitive behavior tests. react-native-reanimated and react-native-svg
 * resolve to the manual mocks in `<root>/__mocks__`; expo-haptics is stubbed
 * below because the injected driver records cues without native modules.
 * Assertions target external behavior (revealed, fired once, placeholder on
 * missing asset), never animation frames or pixels.
 */
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
}));

const FULL_MOTION: JourneyPreferences = {
  hapticsEnabled: true,
  reducedMotion: false,
};

function makeDriver() {
  return jest.fn((_cue: HapticCue) => {});
}

function beatById(id: string): StoryBeat {
  const beat = PLACEHOLDER_BEATS.find((entry) => entry.id === id);
  if (beat === undefined) {
    throw new Error(`Placeholder beat "${id}" is missing`);
  }
  return beat;
}

function renderBeat(
  beat: StoryBeat,
  preferences: JourneyPreferences,
  driver: ReturnType<typeof makeDriver>,
  isInView = false,
): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <StoryBeatView
        beat={beat}
        preferences={preferences}
        hapticDriver={driver}
        isInView={isInView}
      />,
    );
  });
  return renderer;
}

function updateInView(
  renderer: ReactTestRenderer,
  beat: StoryBeat,
  preferences: JourneyPreferences,
  driver: ReturnType<typeof makeDriver>,
  isInView: boolean,
): void {
  act(() => {
    renderer.update(
      <StoryBeatView
        beat={beat}
        preferences={preferences}
        hapticDriver={driver}
        isInView={isInView}
      />,
    );
  });
}

const MIXED_BEAT: StoryBeat = {
  id: 'mixed-order',
  title: 'Mixed order',
  blocks: [
    { kind: 'glow-spacer' },
    {
      kind: 'reveal-text',
      text: 'A short Snippet.',
      animation: 'fade',
      haptic: 'none',
    },
    { kind: 'drawn-line' },
    {
      kind: 'float-photo',
      alt: 'A missing local photo',
      animation: 'parallax',
      haptic: 'none',
    },
  ],
};

describe('Beat Block primitives (external behavior)', () => {
  test('blocks compose in any order with delay and haptic props', () => {
    const renderer = renderBeat(MIXED_BEAT, FULL_MOTION, makeDriver(), true);
    const order = [
      'beat-glow-spacer',
      'beat-text-fade',
      'beat-drawn-line',
      'beat-photo-parallax',
    ];
    // The Reanimated/SVG mocks forward testIDs down the tree, so each
    // marker matches several layers; first appearance keeps document order.
    const seen: string[] = [];
    renderer.root
      .findAll(
        (node) =>
          typeof node.props?.testID === 'string' &&
          order.includes(node.props.testID as string),
      )
      .forEach((node) => {
        const testID = node.props.testID as string;
        if (!seen.includes(testID)) {
          seen.push(testID);
        }
      });
    expect(seen).toEqual(order);
  });

  test('sample beat stays hidden before scrolling into view', () => {
    const renderer = renderBeat(
      beatById('small-habit'),
      FULL_MOTION,
      makeDriver(),
      false,
    );
    expect(
      renderer.root.findByProps({ testID: 'beat-text-hidden' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({ testID: 'beat-photo-hidden' }),
    ).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ testID: 'beat-photo-pop' }),
    ).toHaveLength(0);
  });

  test('scroll reveals text with rise and photo with pop', () => {
    const beat = beatById('small-habit');
    const preferences = FULL_MOTION;
    const driver = makeDriver();
    const renderer = renderBeat(beat, preferences, driver, false);
    updateInView(renderer, beat, preferences, driver, true);
    expect(
      renderer.root.findByProps({ testID: 'beat-text-rise' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({ testID: 'beat-photo-pop' }),
    ).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ testID: 'beat-text-hidden' }),
    ).toHaveLength(0);
  });

  test('scroll reveals text with fade and photo with parallax', () => {
    const fadeBeat = beatById('first-meet');
    const parallaxBeat = beatById('thing-taught');
    const driver = makeDriver();
    const fadeRenderer = renderBeat(fadeBeat, FULL_MOTION, driver, true);
    expect(
      fadeRenderer.root.findByProps({ testID: 'beat-text-fade' }),
    ).toBeTruthy();
    const parallaxRenderer = renderBeat(
      parallaxBeat,
      FULL_MOTION,
      makeDriver(),
      true,
    );
    expect(
      parallaxRenderer.root.findByProps({ testID: 'beat-photo-parallax' }),
    ).toBeTruthy();
  });

  test('reveal and photo Haptic Cues fire once each', () => {
    const beat = beatById('small-habit');
    const preferences = FULL_MOTION;
    const driver = makeDriver();
    const renderer = renderBeat(beat, preferences, driver, false);
    expect(driver).not.toHaveBeenCalled();
    updateInView(renderer, beat, preferences, driver, true);
    expect(driver.mock.calls.map(([cue]) => cue)).toEqual(['light', 'medium']);
    updateInView(renderer, beat, preferences, driver, false);
    updateInView(renderer, beat, preferences, driver, true);
    expect(driver).toHaveBeenCalledTimes(2);
  });

  test('reduced motion reveals instantly with no parallax', () => {
    const beat = beatById('thing-taught');
    const preferences: JourneyPreferences = {
      hapticsEnabled: true,
      reducedMotion: true,
    };
    const driver = makeDriver();
    const renderer = renderBeat(beat, preferences, driver, false);
    expect(
      renderer.root.findByProps({ testID: 'beat-text-instant' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({ testID: 'beat-photo-instant' }),
    ).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ testID: 'beat-photo-parallax' }),
    ).toHaveLength(0);
    expect(driver.mock.calls.map(([cue]) => cue)).toEqual(['light', 'medium']);
  });

  test('haptic toggle mutes every cue while the beat still reveals', () => {
    const beat = beatById('small-habit');
    const preferences: JourneyPreferences = {
      hapticsEnabled: false,
      reducedMotion: false,
    };
    const driver = makeDriver();
    const renderer = renderBeat(beat, preferences, driver, false);
    updateInView(renderer, beat, preferences, driver, true);
    expect(
      renderer.root.findByProps({ testID: 'beat-photo-pop' }),
    ).toBeTruthy();
    expect(driver).not.toHaveBeenCalled();
  });

  test('missing photo asset degrades to a labeled placeholder instead of crashing', () => {
    const renderer = renderBeat(
      beatById('small-habit'),
      FULL_MOTION,
      makeDriver(),
      true,
    );
    expect(
      renderer.root.findAllByProps({ testID: 'beat-photo-image' }),
    ).toHaveLength(0);
    const placeholder = renderer.root.findByProps({
      testID: 'beat-photo-placeholder',
    });
    expect(placeholder.props.accessibilityLabel).toBe(
      'Two coffee cups side by side on a small table',
    );
  });

  test('Beat UI never reaches for Skia, image art, or remote photos', () => {
    // Dependency-constraint guard, not a behavior test: it locks the
    // ticket's costliest mistakes (Skia/image art, remote URLs, per-frame
    // haptics) out of every future edit to these files. Behavior stays
    // covered by the tests above.
    const sources = [
      '../BeatBlocks.tsx',
      '../StoryBeatView.tsx',
      '../useBeatReveal.ts',
      '../beat-haptics.ts',
      '../beat-photos.ts',
    ].map((file) => fs.readFileSync(path.join(__dirname, file), 'utf8'));
    for (const source of sources) {
      expect(source).not.toMatch(/react-native-skia|@shopify/i);
      expect(source).not.toMatch(/from\s+['"]expo-image['"]/);
      expect(source).not.toMatch(/https?:\/\//i);
      expect(source).not.toMatch(/setInterval|requestAnimationFrame/i);
    }
  });
});
