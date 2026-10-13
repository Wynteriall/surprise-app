import {
  getInitialHeroStage,
  getNextHeroStage,
  HERO_STAGE_ORDER,
  type HeroStage,
} from '../journey-decisions';

describe('Tulip Hero journey decisions', () => {
  test('Scroll Journey opens at the Click Me gate with full motion', () => {
    expect(
      getInitialHeroStage({ hapticsEnabled: true, reducedMotion: false }),
    ).toBe('gate-in');
  });

  test('Tulip Hero skips to the static bloom when reduced motion is on', () => {
    expect(
      getInitialHeroStage({ hapticsEnabled: true, reducedMotion: true }),
    ).toBe('bloom');
  });

  test('Bloom Sequence advances through the gated order and stops at bloom', () => {
    const expected: HeroStage[] = [
      'gate-in',
      'gate-out',
      'seed',
      'bud',
      'stems',
      'flower',
      'bloom',
    ];
    expect([...HERO_STAGE_ORDER]).toEqual(expected);
    for (let index = 0; index < expected.length - 1; index += 1) {
      const current = expected[index];
      const next = expected[index + 1];
      if (current === undefined || next === undefined) {
        throw new Error('Bloom Sequence order has a gap');
      }
      expect(getNextHeroStage(current)).toBe(next);
    }
    expect(getNextHeroStage('bloom')).toBeNull();
  });
});
