import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { journeyTheme } from '@/src/theme/tokens';

/**
 * The single Scroll Journey route.
 * Ticket 01: a blank dark journey shell. Tulip Hero, Story Beats,
 * and Finale arrive in later slices.
 */
export default function JourneyIndex() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      testID="scroll-journey"
    >
      <View style={styles.tulipHero} testID="journey-shell-placeholder">
        <Text style={styles.title}>Surprise Journey</Text>
        <Text style={styles.snippet}>
          A blank dark journey. The magic starts here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: journeyTheme.colors.background,
  },
  content: {
    flexGrow: 1,
  },
  tulipHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: journeyTheme.spacing.sectionPadding,
  },
  title: {
    color: journeyTheme.colors.textRose,
    fontSize: 28,
  },
  snippet: {
    color: journeyTheme.colors.textPrimary,
    fontSize: 15,
    marginTop: 12,
  },
});
