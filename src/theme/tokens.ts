/**
 * Journey theme tokens: dark throughout with pink tulip accents.
 * System font first; custom fonts are deferred to a later slice.
 */
export const journeyTheme = {
  colors: {
    /** Near-black with blush depth for the Scroll Journey background. */
    background: '#0a0608',
    /** Lifted blush surface for Journey Sections. */
    surface: '#171014',
    /** Primary warm off-white text. */
    textPrimary: '#f7e8ea',
    /** Deep-rose secondary text. */
    textRose: '#e3a6b0',
    /** Tulip petal pink. */
    tulip: '#e5486f',
    /** Leaf green accent. */
    leaf: '#7fb069',
    /** Soft glow for Hero and Finale accents. */
    glow: '#ff8fab',
  },
  spacing: {
    beatGap: 64,
    sectionPadding: 24,
  },
} as const;

export type JourneyTheme = typeof journeyTheme;
