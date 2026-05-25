import { StyleSheet, Text, View } from 'react-native';
import { TRIAGE_META } from '../lib/startTriageFSM';
import type { TriageColor } from '../lib/types';
import { tokens } from '../theme/tokens';

const TINTS: Record<TriageColor, { fg: string; bg: string }> = {
  RED: { fg: tokens.triage.red, bg: tokens.errorContainer },
  YELLOW: { fg: tokens.secondary, bg: tokens.secondaryFixed },
  GREEN: { fg: tokens.tertiary, bg: tokens.tertiaryContainer },
  BLACK: { fg: tokens.triage.black, bg: tokens.surfaceContainer },
};

export function SeverityChip({ triage }: { triage: TriageColor }) {
  const meta = TRIAGE_META[triage];
  const tint = TINTS[triage];
  return (
    <View style={[styles.chip, { borderColor: tint.fg, backgroundColor: tint.bg }]}>
      <View style={[styles.dot, { backgroundColor: tint.fg }]} />
      <View>
        <Text style={[styles.label, { color: tint.fg }]}>{meta.label}</Text>
        <Text style={styles.sub}>{meta.sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: tokens.radius.card,
    borderWidth: 1.5,
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  label: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  sub: {
    color: tokens.onSurfaceVariant,
    fontFamily: 'PublicSans_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
});
