import fs from 'node:fs';
import path from 'node:path';
import { act, type ReactTestRenderer } from 'react-test-renderer';
import { create } from 'react-test-renderer';

import type { HapticCue, JourneyPreferences } from '../journey-decisions';
import { TulipHero } from '../TulipHero';

/**
 * Tulip Hero behavior tests. react-native-reanimated and react-native-svg
 * resolve to the manual mocks in `<root>/__mocks__` (applied automatically
 * to node modules); expo-haptics is stubbed below because the injected
 * driver records cues without native modules.
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

function renderHero(
  preferences: JourneyPreferences,
  driver: ReturnType<typeof makeDriver>,
): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <TulipHero preferences={preferences} hapticDriver={driver} />,
    );
  });
  return renderer;
}

/**
 * Flushes the staged auto-advance chain. Each Bloom Sequence stage schedules
 * its successor from an effect, so timers advance one stage per act flush.
 */
function runBloomSequence() {
  for (let step = 0; step < 10; step += 1) {
    act(() => {
      jest.advanceTimersByTime(1200);
    });
  }
}

afterEach(() => {
  jest.useRealTimers();
});

describe('Tulip Hero gated bloom (external behavior)', () => {
  test('Scroll Journey opens at the Click Me gate', () => {
    jest.useFakeTimers();
    const renderer = renderHero(FULL_MOTION, makeDriver());
    expect(renderer.root.findByProps({ testID: 'hero-gate' })).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ testID: 'tulip-static-bloom' }),
    ).toHaveLength(0);
  });

  test('gate tap starts the bloom and each stage ticks once with medium at bloom', () => {
    jest.useFakeTimers();
    const driver = makeDriver();
    const renderer = renderHero(FULL_MOTION, driver);

    act(() => {
      renderer.root.findByProps({ testID: 'hero-gate-press' }).props.onPress();
    });
    expect(driver).toHaveBeenCalledWith('light');

    runBloomSequence();

    expect(renderer.root.findByProps({ testID: 'hero-bloom' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'hero-line-3' })).toBeTruthy();
    expect(renderer.root.findAllByProps({ testID: 'hero-gate' })).toHaveLength(
      0,
    );
    const cues = driver.mock.calls.map(([cue]) => cue as HapticCue);
    expect(cues.filter((cue) => cue === 'light')).toHaveLength(4);
    expect(cues.filter((cue) => cue === 'medium')).toHaveLength(1);
    expect(cues[cues.length - 1]).toBe('medium');
  });

  test('reduced motion renders the static bloom with no staged ticks', () => {
    jest.useFakeTimers();
    const driver = makeDriver();
    const renderer = renderHero(
      { hapticsEnabled: true, reducedMotion: true },
      driver,
    );

    expect(
      renderer.root.findByProps({ testID: 'tulip-static-bloom' }),
    ).toBeTruthy();
    expect(renderer.root.findAllByProps({ testID: 'hero-gate' })).toHaveLength(
      0,
    );

    act(() => {
      jest.runAllTimers();
    });
    expect(driver).not.toHaveBeenCalled();
  });

  test('haptic toggle mutes every staged cue while the bloom still lands', () => {
    jest.useFakeTimers();
    const driver = makeDriver();
    const renderer = renderHero(
      { hapticsEnabled: false, reducedMotion: false },
      driver,
    );

    act(() => {
      renderer.root.findByProps({ testID: 'hero-gate-press' }).props.onPress();
    });
    runBloomSequence();

    expect(renderer.root.findByProps({ testID: 'hero-bloom' })).toBeTruthy();
    expect(driver).not.toHaveBeenCalled();
  });

  test('Tulip Hero never reaches for Skia or images', () => {
    const sources = [
      '../TulipHero.tsx',
      '../useHeroSequence.ts',
      '../hero-haptics.ts',
    ].map((file) => fs.readFileSync(path.join(__dirname, file), 'utf8'));
    for (const source of sources) {
      expect(source).not.toMatch(/react-native-skia|@shopify/i);
      expect(source).not.toMatch(/from\s+['"]expo-image['"]/);
      expect(source).not.toMatch(/<Image[\s>]/);
    }
  });
});
