import type { JourneyPreferences } from '../journey-decisions';
import {
  getFinaleHapticTarget,
  shouldFireFinaleHaptic,
} from '../finale-haptics';

const ENABLED: JourneyPreferences = {
  hapticsEnabled: true,
  reducedMotion: false,
};

describe('Finale haptics (seam-driven)', () => {
  test('hearts bloom lands medium through the seam', () => {
    expect(shouldFireFinaleHaptic([], ENABLED)).toBe('medium');
  });

  test('finale target fires once per Scroll Journey', () => {
    expect(shouldFireFinaleHaptic([], ENABLED)).toBe('medium');
    expect(
      shouldFireFinaleHaptic([getFinaleHapticTarget()], ENABLED),
    ).toBeNull();
  });

  test('haptic toggle mutes the finale medium cue', () => {
    const muted: JourneyPreferences = {
      hapticsEnabled: false,
      reducedMotion: false,
    };
    expect(shouldFireFinaleHaptic([], muted)).toBeNull();
  });

  test('motion and haptics stay independently controlled through the seam', () => {
    const calm: JourneyPreferences = {
      hapticsEnabled: true,
      reducedMotion: true,
    };
    expect(shouldFireFinaleHaptic([], calm)).toBe('medium');
  });
});
