/**
 * Editable placeholder Story Beats for the Scroll Journey.
 * Swap the Snippet words and local photos later without code changes.
 * Shape is enforced by validateStoryBeats in the journey-decision seam.
 */
import type { StoryBeat } from './journey-decisions';

/** Five placeholder moments: first meet through future wish. */
export const PLACEHOLDER_BEATS: StoryBeat[] = [
  {
    id: 'first-meet',
    title: 'First meet',
    blocks: [
      {
        kind: 'reveal-text',
        text: 'Coffee went cold while we kept talking.',
        animation: 'rise',
        haptic: 'light',
      },
      {
        kind: 'reveal-text',
        text: 'You laughed, and the room felt lighter.',
        animation: 'fade',
        haptic: 'none',
      },
      { kind: 'drawn-line' },
    ],
  },
  {
    id: 'small-habit',
    title: 'Small habit',
    blocks: [
      {
        kind: 'reveal-text',
        text: 'You always save me the last bite.',
        animation: 'rise',
        haptic: 'light',
      },
      {
        kind: 'float-photo',
        asset: 'assets/beats/small-habit.jpg',
        alt: 'Two coffee cups side by side on a small table',
        animation: 'pop',
        haptic: 'medium',
      },
    ],
  },
  {
    id: 'hard-day-support',
    title: 'Hard-day support',
    blocks: [
      {
        kind: 'reveal-text',
        text: 'On heavy days you just sit with me.',
        animation: 'fade',
        haptic: 'light',
      },
      {
        kind: 'reveal-text',
        text: 'No fixing, only warmth beside me.',
        animation: 'rise',
        haptic: 'none',
      },
      { kind: 'glow-spacer' },
    ],
  },
  {
    id: 'thing-taught',
    title: 'Thing taught',
    blocks: [
      {
        kind: 'reveal-text',
        text: 'You taught me to slow down and notice.',
        animation: 'rise',
        haptic: 'light',
      },
      {
        kind: 'float-photo',
        asset: 'assets/beats/thing-taught.jpg',
        alt: 'Evening walk path lined with soft lights',
        animation: 'parallax',
        haptic: 'medium',
      },
    ],
  },
  {
    id: 'future-wish',
    title: 'Future wish',
    blocks: [
      {
        kind: 'reveal-text',
        text: 'More slow mornings, more shared skies.',
        animation: 'fade',
        haptic: 'light',
      },
      { kind: 'drawn-line' },
      {
        kind: 'reveal-text',
        text: 'Whatever comes, I choose us.',
        animation: 'rise',
        haptic: 'none',
      },
    ],
  },
];
