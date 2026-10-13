import type { BeatBlock, JourneyPreferences } from '../journey-decisions';
import {
  getBeatBlockHapticTarget,
  shouldFireBeatBlockHaptic,
} from '../beat-haptics';

const ENABLED: JourneyPreferences = {
  hapticsEnabled: true,
  reducedMotion: false,
};

function textBlock(): BeatBlock {
  return {
    kind: 'reveal-text',
    text: 'A short Snippet.',
    animation: 'rise',
    haptic: 'light',
  };
}

function photoBlock(): BeatBlock {
  return {
    kind: 'float-photo',
    alt: 'A small local photo',
    animation: 'pop',
    haptic: 'medium',
  };
}

describe('Story Beat block haptics (seam-driven)', () => {
  test('reveal-text Snippet ticks light and float-photo pops medium', () => {
    expect(
      shouldFireBeatBlockHaptic(textBlock(), 'beat-1', 0, [], ENABLED),
    ).toBe('light');
    expect(
      shouldFireBeatBlockHaptic(photoBlock(), 'beat-1', 1, [], ENABLED),
    ).toBe('medium');
  });

  test('muted block choices and decorative blocks stay silent', () => {
    expect(
      shouldFireBeatBlockHaptic(
        {
          kind: 'reveal-text',
          text: 'Quiet Snippet.',
          animation: 'fade',
          haptic: 'none',
        },
        'beat-1',
        0,
        [],
        ENABLED,
      ),
    ).toBeNull();
    expect(
      shouldFireBeatBlockHaptic(
        {
          kind: 'float-photo',
          alt: 'Quiet photo',
          animation: 'pop',
          haptic: 'none',
        },
        'beat-1',
        1,
        [],
        ENABLED,
      ),
    ).toBeNull();
    expect(
      shouldFireBeatBlockHaptic(
        { kind: 'drawn-line' },
        'beat-1',
        2,
        [],
        ENABLED,
      ),
    ).toBeNull();
    expect(
      shouldFireBeatBlockHaptic(
        { kind: 'glow-spacer' },
        'beat-1',
        3,
        [],
        ENABLED,
      ),
    ).toBeNull();
  });

  test('each Beat Block target fires once per Scroll Journey', () => {
    expect(
      shouldFireBeatBlockHaptic(textBlock(), 'beat-1', 0, [], ENABLED),
    ).toBe('light');
    expect(
      shouldFireBeatBlockHaptic(
        textBlock(),
        'beat-1',
        0,
        [getBeatBlockHapticTarget('beat-1', 0)],
        ENABLED,
      ),
    ).toBeNull();
    expect(
      shouldFireBeatBlockHaptic(
        photoBlock(),
        'beat-1',
        1,
        [getBeatBlockHapticTarget('beat-1', 0)],
        ENABLED,
      ),
    ).toBe('medium');
  });

  test('haptic toggle mutes reveal and photo cues', () => {
    const muted: JourneyPreferences = {
      hapticsEnabled: false,
      reducedMotion: false,
    };
    expect(
      shouldFireBeatBlockHaptic(textBlock(), 'beat-1', 0, [], muted),
    ).toBeNull();
    expect(
      shouldFireBeatBlockHaptic(photoBlock(), 'beat-1', 1, [], muted),
    ).toBeNull();
  });

  test('motion and haptics stay independently controlled through the seam', () => {
    const calm: JourneyPreferences = {
      hapticsEnabled: true,
      reducedMotion: true,
    };
    expect(shouldFireBeatBlockHaptic(textBlock(), 'beat-1', 0, [], calm)).toBe(
      'light',
    );
    expect(shouldFireBeatBlockHaptic(photoBlock(), 'beat-1', 1, [], calm)).toBe(
      'medium',
    );
  });
});
