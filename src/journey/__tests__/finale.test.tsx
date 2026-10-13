import fs from 'node:fs';
import path from 'node:path';
import { act, type ReactTestRenderer } from 'react-test-renderer';
import { create } from 'react-test-renderer';

import type { HapticCue, JourneyPreferences } from '../journey-decisions';
import { MAX_SNIPPET_LENGTH } from '../journey-decisions';
import { Finale } from '../Finale';

/**
 * Finale behavior tests. react-native-reanimated and react-native-svg
 * resolve to the manual mocks in `<root>/__mocks__`; expo-haptics is stubbed
 * below because the injected driver records cues without native modules.
 * Assertions target external behavior (note shown, hearts bloomed once,
 * medium fired once), never animation frames or pixels.
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

function renderFinale(
  preferences: JourneyPreferences,
  driver: ReturnType<typeof makeDriver>,
  isInView = false,
): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <Finale
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
  preferences: JourneyPreferences,
  driver: ReturnType<typeof makeDriver>,
  isInView: boolean,
): void {
  act(() => {
    renderer.update(
      <Finale
        preferences={preferences}
        hapticDriver={driver}
        isInView={isInView}
      />,
    );
  });
}

describe('Finale hearts bloom (external behavior)', () => {
  test('short note stays hidden before scrolling into view', () => {
    const renderer = renderFinale(FULL_MOTION, makeDriver(), false);
    expect(renderer.root.findByProps({ testID: 'finale' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'finale-note' })).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ testID: 'finale-hearts' }),
    ).toHaveLength(0);
  });

  test('scroll reveals the short note with hearts bloom and one medium cue', () => {
    const driver = makeDriver();
    const renderer = renderFinale(FULL_MOTION, driver, false);
    expect(driver).not.toHaveBeenCalled();
    updateInView(renderer, FULL_MOTION, driver, true);
    const note = renderer.root.findByProps({ testID: 'finale-note' });
    expect(note).toBeTruthy();
    const noteText = Array.isArray(note.props.children)
      ? note.props.children.join('')
      : String(note.props.children ?? '');
    expect(noteText.trim().length).toBeGreaterThan(0);
    expect(noteText.length).toBeLessThanOrEqual(MAX_SNIPPET_LENGTH);
    expect(renderer.root.findByProps({ testID: 'finale-hearts' })).toBeTruthy();
    expect(driver.mock.calls.map(([cue]) => cue)).toEqual(['medium']);
  });

  test('finale medium cue fires once per Scroll Journey', () => {
    const driver = makeDriver();
    const renderer = renderFinale(FULL_MOTION, driver, false);
    updateInView(renderer, FULL_MOTION, driver, true);
    updateInView(renderer, FULL_MOTION, driver, false);
    updateInView(renderer, FULL_MOTION, driver, true);
    expect(driver).toHaveBeenCalledTimes(1);
  });

  test('reduced motion renders a static finale with no staged animation', () => {
    const driver = makeDriver();
    const renderer = renderFinale(
      { hapticsEnabled: true, reducedMotion: true },
      driver,
      false,
    );
    expect(renderer.root.findByProps({ testID: 'finale' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'finale-note' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'finale-static' })).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ testID: 'finale-hearts' }),
    ).toHaveLength(0);
  });

  test('haptic toggle mutes the finale cue while the note still blooms', () => {
    const driver = makeDriver();
    const renderer = renderFinale(
      { hapticsEnabled: false, reducedMotion: false },
      driver,
      false,
    );
    updateInView(
      renderer,
      { hapticsEnabled: false, reducedMotion: false },
      driver,
      true,
    );
    expect(renderer.root.findByProps({ testID: 'finale-hearts' })).toBeTruthy();
    expect(driver).not.toHaveBeenCalled();
  });

  test('Finale never reaches for Skia, image art, or remote photos', () => {
    // Dependency-constraint guard, not a behavior test: it locks the
    // ticket's costliest mistakes (Skia/image hearts, remote URLs,
    // per-frame haptics) out of every future edit to these files. Behavior
    // stays covered by the tests above.
    const sources = [
      '../Finale.tsx',
      '../useFinaleReveal.ts',
      '../finale-haptics.ts',
    ].map((file) => fs.readFileSync(path.join(__dirname, file), 'utf8'));
    for (const source of sources) {
      expect(source).not.toMatch(/react-native-skia|@shopify/i);
      expect(source).not.toMatch(/from\s+['"]expo-image['"]/);
      expect(source).not.toMatch(/<Image[\s>]/);
      expect(source).not.toMatch(/https?:\/\//i);
      expect(source).not.toMatch(/setInterval|requestAnimationFrame/i);
    }
  });
});
