import { memo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { journeyTheme } from '@/src/theme/tokens';

export interface HapticToggleProps {
  /** Whether Haptic Cues are enabled; the seam mutes every cue when false. */
  enabled: boolean;
  /** Notifies the Scroll Journey when the viewer flips the toggle. */
  onChange: (enabled: boolean) => void;
}

/**
 * Small, calm, journey-appropriate haptic toggle. It only flips the
 * hapticsEnabled seam input; every staged cue (hero ticks, beat reveals,
 * photo pops, finale medium) mutes at once through the seam.
 */
export const HapticToggle = memo(function HapticToggle({
  enabled,
  onChange,
}: HapticToggleProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel="Haptic cues toggle">
      <Text style={styles.label}>Haptics</Text>
      <Switch
        testID="haptic-toggle"
        value={enabled}
        onValueChange={onChange}
        accessibilityLabel="Haptic cues on or off"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingHorizontal: journeyTheme.spacing.sectionPadding,
    paddingVertical: 8,
  },
  label: {
    color: journeyTheme.colors.textRose,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
