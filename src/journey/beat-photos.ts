/**
 * Local beat photo registry with graceful degradation.
 *
 * Placeholder beats name photos by local asset path (see
 * `placeholder-beats.ts`). Those files do not exist on disk yet, so this
 * registry stays empty and every lookup resolves to null; the float-photo
 * Beat Block then renders a labeled SVG placeholder instead of crashing.
 * When real photos land, add one static entry per file below — lookups stay
 * local-only, never remote URLs.
 */
import type { ImageSourcePropType } from 'react-native';

/** Known local beat photos, mapped from their placeholder asset path. */
const BEAT_PHOTO_REGISTRY: Record<string, ImageSourcePropType> = {
  // Example once a file lands:
  // 'assets/beats/small-habit.jpg': require('@/assets/beats/small-habit.jpg'),
};

/**
 * Resolves a placeholder asset path to a local image source, or null when
 * the file is unknown or missing so the caller can degrade gracefully.
 */
export function resolveBeatPhotoAsset(
  asset: string | undefined,
): ImageSourcePropType | null {
  if (asset === undefined) {
    return null;
  }
  return BEAT_PHOTO_REGISTRY[asset] ?? null;
}
