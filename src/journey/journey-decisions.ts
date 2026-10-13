/**
 * Pure journey decisions for the Scroll Journey.
 *
 * This is the single journey-decision seam: UI layers (Tulip Hero, Story Beats,
 * Finale) ask these functions what to do and never encode stage order,
 * reveal-once, haptic-fire-once, or content validity themselves.
 * Reduced-motion and the haptic toggle enter here as inputs.
 */

/** One stage of the gated seven-stage Tulip Hero Bloom Sequence. */
export type HeroStage =
  'gate-in' | 'gate-out' | 'seed' | 'bud' | 'stems' | 'flower' | 'bloom';

/** The gated bloom order. The sequence stops at bloom. */
export const HERO_STAGE_ORDER: readonly HeroStage[] = [
  'gate-in',
  'gate-out',
  'seed',
  'bud',
  'stems',
  'flower',
  'bloom',
];

/**
 * Viewer preferences that shape journey decisions.
 * Both fields are live inputs: reducedMotion short-circuits the Tulip Hero
 * timeline and Story Beat reveals, while hapticsEnabled mutes every Haptic Cue.
 */
export interface JourneyPreferences {
  hapticsEnabled: boolean;
  reducedMotion: boolean;
}

/**
 * Decides the opening Tulip Hero stage.
 * Reduced motion skips the timeline straight to the static bloom.
 */
export function getInitialHeroStage(
  preferences: JourneyPreferences,
): HeroStage {
  if (preferences.reducedMotion) {
    return 'bloom';
  }
  return 'gate-in';
}

/**
 * Decides the next Bloom Sequence stage, or null once the bloom is reached.
 */
export function getNextHeroStage(current: HeroStage): HeroStage | null {
  const index = HERO_STAGE_ORDER.indexOf(current);
  if (index === -1) {
    return null;
  }
  const next: HeroStage | undefined = HERO_STAGE_ORDER[index + 1];
  return next ?? null;
}

/** Staged Haptic Cue intensities used across the Scroll Journey. */
export type HapticCue = 'light' | 'medium';

/**
 * Decides which Haptic Cue a Tulip Hero stage fires.
 * Grow stages tick light, the bloom lands medium, and idle stages stay silent.
 * The gate tap ticks light so the start feels responsive.
 */
export function getHeroStageHaptic(stage: HeroStage): HapticCue | null {
  switch (stage) {
    case 'gate-out':
    case 'bud':
    case 'stems':
    case 'flower':
      return 'light';
    case 'bloom':
      return 'medium';
    case 'gate-in':
    case 'seed':
      return null;
  }
}

/**
 * Decides whether a Story Beat should reveal now.
 * Each beat reveals once: an already revealed beat never re-reveals.
 * Reduced motion reveals instantly without waiting for scroll position.
 */
export function shouldRevealBeat(
  beatId: string,
  revealedBeatIds: readonly string[],
  isInView: boolean,
  preferences: JourneyPreferences,
): boolean {
  if (revealedBeatIds.includes(beatId)) {
    return false;
  }
  if (preferences.reducedMotion) {
    return true;
  }
  return isInView;
}

/**
 * Decides whether Story Beats reveal instantly instead of animating.
 * Reduced motion skips parallax and rise/fade reveals.
 */
export function shouldRevealInstantly(
  preferences: JourneyPreferences,
): boolean {
  return preferences.reducedMotion;
}

/**
 * Decides whether a Haptic Cue should fire for a target.
 * Each target fires once per Scroll Journey; the haptic toggle mutes all cues.
 * Reduced motion travels through the same toggle so motion and haptics stay
 * independently controlled.
 */
export function shouldFireHaptic(
  targetId: string,
  firedTargetIds: readonly string[],
  preferences: JourneyPreferences,
): boolean {
  if (!preferences.hapticsEnabled) {
    return false;
  }
  return !firedTargetIds.includes(targetId);
}

/** Fade or rise animation for a reveal-text Beat Block Snippet. */
export type BeatTextAnimation = 'fade' | 'rise';

/** Pop or parallax animation for a float-photo Beat Block. */
export type BeatPhotoAnimation = 'pop' | 'parallax';

/** One small unit inside a Story Beat. */
export type BeatBlock =
  | {
      kind: 'reveal-text';
      text: string;
      animation: BeatTextAnimation;
      haptic: 'light' | 'none';
    }
  | {
      kind: 'float-photo';
      /** Local asset path; undefined reserves the optional photo slot. */
      asset?: string;
      alt: string;
      animation: BeatPhotoAnimation;
      haptic: 'medium' | 'none';
    }
  | { kind: 'drawn-line' }
  | { kind: 'glow-spacer' };

/** One cherished moment told as an ordered list of small Beat Blocks. */
export interface StoryBeat {
  id: string;
  title: string;
  blocks: BeatBlock[];
}

/** A Snippet stays to one or two lines, never a full letter. */
export const MAX_SNIPPET_LENGTH = 140;

/** A Story Beat carries at most one small photo, never a photo dump. */
export const MAX_PHOTOS_PER_BEAT = 1;

/** The Scroll Journey holds exactly five Story Beats. */
export const STORY_BEAT_COUNT = 5;

/** Content validity verdict for editable Story Beat data. */
export interface BeatValidity {
  valid: boolean;
  errors: string[];
}

/**
 * Validates editable Story Beat content without rendering anything.
 * Checks the five-moment shape, short Snippets, at most one photo per beat
 * with alt text, unique identities, and per-block animation plus Haptic Cue
 * choices.
 */
export function validateStoryBeats(beats: readonly StoryBeat[]): BeatValidity {
  const errors: string[] = [];

  if (beats.length !== STORY_BEAT_COUNT) {
    errors.push(
      `Scroll Journey needs exactly five Story Beats, found ${beats.length}.`,
    );
  }

  const seenIds = new Set<string>();
  beats.forEach((beat, index) => {
    const label =
      beat.id.trim().length > 0 ? `"${beat.id}"` : `at index ${index}`;
    if (beat.id.trim().length === 0) {
      errors.push(`Story Beat at index ${index} needs a non-empty identity.`);
    } else {
      if (seenIds.has(beat.id)) {
        errors.push(
          `Story Beat identity "${beat.id}" must stay unique (duplicate at index ${index}).`,
        );
      }
      seenIds.add(beat.id);
    }

    if (beat.title.trim().length === 0) {
      errors.push(`Story Beat ${label} needs a title.`);
    }

    if (beat.blocks.length === 0) {
      errors.push(`Story Beat ${label} needs at least one Beat Block.`);
    }

    const snippetCount = beat.blocks.filter(
      (block) => block.kind === 'reveal-text',
    ).length;
    if (snippetCount === 0) {
      errors.push(
        `Story Beat ${label} needs at least one reveal-text Snippet.`,
      );
    }

    const photoCount = beat.blocks.filter(
      (block) => block.kind === 'float-photo',
    ).length;
    if (photoCount > MAX_PHOTOS_PER_BEAT) {
      errors.push(
        `Story Beat ${label} holds at most one float-photo Beat Block, found ${photoCount} (never a photo dump).`,
      );
    }

    beat.blocks.forEach((block) => {
      switch (block.kind) {
        case 'reveal-text': {
          if (block.text.trim().length === 0) {
            errors.push(`Snippet in Story Beat ${label} must not be empty.`);
          } else if (block.text.length > MAX_SNIPPET_LENGTH) {
            errors.push(
              `Snippet in Story Beat ${label} must stay short (one or two lines, at most ${MAX_SNIPPET_LENGTH} chars, found ${block.text.length}).`,
            );
          }
          if (block.animation !== 'fade' && block.animation !== 'rise') {
            errors.push(
              `Snippet in Story Beat ${label} needs a fade or rise animation.`,
            );
          }
          if (block.haptic !== 'light' && block.haptic !== 'none') {
            errors.push(
              `Snippet in Story Beat ${label} needs a light or none Haptic Cue.`,
            );
          }
          break;
        }
        case 'float-photo': {
          if (block.alt.trim().length === 0) {
            errors.push(
              `float-photo Beat Block in Story Beat ${label} needs alt text.`,
            );
          }
          if (block.animation !== 'pop' && block.animation !== 'parallax') {
            errors.push(
              `float-photo Beat Block in Story Beat ${label} needs a pop or parallax animation.`,
            );
          }
          if (block.haptic !== 'medium' && block.haptic !== 'none') {
            errors.push(
              `float-photo Beat Block in Story Beat ${label} needs a medium or none Haptic Cue.`,
            );
          }
          if (
            block.asset !== undefined &&
            (block.asset.trim().length === 0 ||
              block.asset.startsWith('http://') ||
              block.asset.startsWith('https://'))
          ) {
            errors.push(
              `float-photo Beat Block in Story Beat ${label} needs a local photo asset, never a remote URL.`,
            );
          }
          break;
        }
        case 'drawn-line':
        case 'glow-spacer': {
          break;
        }
        default: {
          const unknown: never = block;
          errors.push(`Story Beat ${label} holds an unknown Beat Block kind.`);
          void unknown;
          break;
        }
      }
    });
  });

  return { valid: errors.length === 0, errors };
}
