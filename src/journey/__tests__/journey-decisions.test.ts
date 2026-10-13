import {
  getHeroStageHaptic,
  getInitialHeroStage,
  getNextHeroStage,
  HERO_STAGE_ORDER,
  shouldFireHaptic,
  shouldRevealBeat,
  shouldRevealInstantly,
  validateStoryBeats,
  type HeroStage,
  type JourneyPreferences,
  type StoryBeat,
} from '../journey-decisions';
import { PLACEHOLDER_BEATS } from '../placeholder-beats';

const FULL_MOTION: JourneyPreferences = {
  hapticsEnabled: true,
  reducedMotion: false,
};

function makeBeat(overrides: Partial<StoryBeat> = {}): StoryBeat {
  return {
    id: 'first-meet',
    title: 'First meet',
    blocks: [
      {
        kind: 'reveal-text',
        text: 'Coffee went cold while we talked.',
        animation: 'rise',
        haptic: 'light',
      },
    ],
    ...overrides,
  };
}

function makeFive(first: StoryBeat): StoryBeat[] {
  return [
    first,
    makeBeat({ id: 'b2' }),
    makeBeat({ id: 'b3' }),
    makeBeat({ id: 'b4' }),
    makeBeat({ id: 'b5' }),
  ];
}

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

describe('Tulip Hero Haptic Cues', () => {
  test('grow stages tick light and bloom lands medium', () => {
    expect(getHeroStageHaptic('bud')).toBe('light');
    expect(getHeroStageHaptic('stems')).toBe('light');
    expect(getHeroStageHaptic('flower')).toBe('light');
    expect(getHeroStageHaptic('bloom')).toBe('medium');
  });

  test('gate tap ticks light while idle stages stay silent', () => {
    expect(getHeroStageHaptic('gate-out')).toBe('light');
    expect(getHeroStageHaptic('gate-in')).toBeNull();
    expect(getHeroStageHaptic('seed')).toBeNull();
  });
});

describe('Story Beat reveal-once', () => {
  test('Story Beat reveals when it enters view', () => {
    expect(shouldRevealBeat('beat-1', [], true, FULL_MOTION)).toBe(true);
  });

  test('Story Beat stays hidden while out of view with full motion', () => {
    expect(shouldRevealBeat('beat-1', [], false, FULL_MOTION)).toBe(false);
  });

  test('Story Beat reveal fires once per beat', () => {
    expect(shouldRevealBeat('beat-1', ['beat-1'], true, FULL_MOTION)).toBe(
      false,
    );
    expect(shouldRevealBeat('beat-1', ['beat-2'], true, FULL_MOTION)).toBe(
      true,
    );
  });

  test('reduced motion reveals Story Beats instantly without waiting for scroll', () => {
    const preferences: JourneyPreferences = {
      hapticsEnabled: true,
      reducedMotion: true,
    };
    expect(shouldRevealBeat('beat-1', [], false, preferences)).toBe(true);
    expect(shouldRevealInstantly(preferences)).toBe(true);
    expect(shouldRevealInstantly(FULL_MOTION)).toBe(false);
  });

  test('reduced motion never re-reveals an already revealed Story Beat', () => {
    const preferences: JourneyPreferences = {
      hapticsEnabled: true,
      reducedMotion: true,
    };
    expect(shouldRevealBeat('beat-1', ['beat-1'], false, preferences)).toBe(
      false,
    );
  });
});

describe('Haptic Cue fire-once', () => {
  test('Haptic Cue fires once per target when the toggle is on', () => {
    expect(shouldFireHaptic('snippet-1', [], FULL_MOTION)).toBe(true);
    expect(shouldFireHaptic('snippet-1', ['snippet-1'], FULL_MOTION)).toBe(
      false,
    );
  });

  test('each Haptic Cue target fires independently', () => {
    expect(shouldFireHaptic('photo-1', ['snippet-1'], FULL_MOTION)).toBe(true);
  });

  test('haptic toggle mutes every Haptic Cue', () => {
    const muted: JourneyPreferences = {
      hapticsEnabled: false,
      reducedMotion: false,
    };
    expect(shouldFireHaptic('snippet-1', [], muted)).toBe(false);
    expect(shouldFireHaptic('photo-1', [], muted)).toBe(false);
  });

  test('haptic toggle mutes reduced-motion reveals too', () => {
    const mutedReduced: JourneyPreferences = {
      hapticsEnabled: false,
      reducedMotion: true,
    };
    expect(shouldFireHaptic('snippet-1', [], mutedReduced)).toBe(false);
  });
});

describe('Story Beat content validity', () => {
  test('placeholder Story Beats validate as five short moments with optional photos', () => {
    expect(PLACEHOLDER_BEATS).toHaveLength(5);
    expect(validateStoryBeats(PLACEHOLDER_BEATS)).toEqual({
      valid: true,
      errors: [],
    });
  });

  test('Story Beat list must hold exactly five moments', () => {
    const result = validateStoryBeats([makeBeat()]);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/five/i);
  });

  test('Snippet longer than a line or two is rejected', () => {
    const beat = makeBeat({
      blocks: [
        {
          kind: 'reveal-text',
          text: 'x'.repeat(281),
          animation: 'rise',
          haptic: 'light',
        },
      ],
    });
    const beats = makeFive(beat);
    const result = validateStoryBeats(beats);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/snippet/i);
  });

  test('a Story Beat is never a photo dump', () => {
    const beat = makeBeat({
      blocks: [
        {
          kind: 'reveal-text',
          text: 'A short Snippet.',
          animation: 'fade',
          haptic: 'light',
        },
        {
          kind: 'float-photo',
          alt: 'First photo',
          animation: 'pop',
          haptic: 'medium',
        },
        {
          kind: 'float-photo',
          alt: 'Second photo',
          animation: 'pop',
          haptic: 'medium',
        },
      ],
    });
    const beats = makeFive(beat);
    const result = validateStoryBeats(beats);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/photo/i);
  });

  test('float-photo Beat Block requires alt text', () => {
    const beat = makeBeat({
      blocks: [
        {
          kind: 'float-photo',
          alt: '',
          animation: 'pop',
          haptic: 'medium',
        },
      ],
    });
    const beats = makeFive(beat);
    const result = validateStoryBeats(beats);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/alt/i);
  });

  test('Story Beat identities stay unique and each beat keeps a Snippet', () => {
    const dupe = validateStoryBeats([
      makeBeat(),
      makeBeat({ title: 'Same moment twice' }),
      makeBeat({ id: 'b3' }),
      makeBeat({ id: 'b4' }),
      makeBeat({ id: 'b5' }),
    ]);
    expect(dupe.valid).toBe(false);
    expect(dupe.errors.join(' ')).toMatch(/unique|duplicate/i);

    const photoOnly = makeBeat({
      id: 'photo-only',
      blocks: [
        {
          kind: 'float-photo',
          alt: 'Only a photo',
          animation: 'pop',
          haptic: 'medium',
        },
      ],
    });
    const missing = validateStoryBeats(makeFive(photoOnly));
    expect(missing.valid).toBe(false);
    expect(missing.errors.join(' ')).toMatch(/snippet|text/i);
  });
});
