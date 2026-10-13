import type { HeroStage, JourneyPreferences } from '../journey-decisions';
import {
  getHeroHapticTarget,
  shouldFireHeroStageHaptic,
} from '../hero-haptics';

const ENABLED: JourneyPreferences = {
  hapticsEnabled: true,
  reducedMotion: false,
};

describe('Tulip Hero staged haptics (seam-driven)', () => {
  test('bloom lands medium through the seam', () => {
    expect(shouldFireHeroStageHaptic('bloom', [], ENABLED)).toBe('medium');
  });

  test('grow stages plus gate tap tick light through the seam', () => {
    const stages: HeroStage[] = ['gate-out', 'bud', 'stems', 'flower'];
    for (const stage of stages) {
      expect(shouldFireHeroStageHaptic(stage, [], ENABLED)).toBe('light');
    }
  });

  test('idle stages stay silent', () => {
    expect(shouldFireHeroStageHaptic('gate-in', [], ENABLED)).toBeNull();
    expect(shouldFireHeroStageHaptic('seed', [], ENABLED)).toBeNull();
  });

  test('each stage fires once per Scroll Journey', () => {
    expect(shouldFireHeroStageHaptic('bud', [], ENABLED)).toBe('light');
    expect(
      shouldFireHeroStageHaptic('bud', [getHeroHapticTarget('bud')], ENABLED),
    ).toBeNull();
    expect(
      shouldFireHeroStageHaptic('stems', [getHeroHapticTarget('bud')], ENABLED),
    ).toBe('light');
  });

  test('haptic toggle mutes every staged cue including bloom', () => {
    const muted: JourneyPreferences = {
      hapticsEnabled: false,
      reducedMotion: false,
    };
    expect(shouldFireHeroStageHaptic('bud', [], muted)).toBeNull();
    expect(shouldFireHeroStageHaptic('bloom', [], muted)).toBeNull();
  });

  test('motion and haptics stay independently controlled through the seam', () => {
    const calm: JourneyPreferences = {
      hapticsEnabled: true,
      reducedMotion: true,
    };
    expect(shouldFireHeroStageHaptic('bloom', [], calm)).toBe('medium');
    expect(shouldFireHeroStageHaptic('bud', [], calm)).toBe('light');
  });
});
