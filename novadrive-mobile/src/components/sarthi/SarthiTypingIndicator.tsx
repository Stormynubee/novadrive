import { StyleSheet, View } from 'react-native';
import { tokens } from '../../theme/tokens';

export function SarthiTypingIndicator() {
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, styles.d1]} />
      <View style={[styles.dot, styles.d2]} />
      <View style={[styles.dot, styles.d3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    marginBottom: tokens.spacing.stackSm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.onSurfaceVariant,
    opacity: 0.5,
  },
  d1: { opacity: 0.9 },
  d2: { opacity: 0.6 },
  d3: { opacity: 0.35 },
});
