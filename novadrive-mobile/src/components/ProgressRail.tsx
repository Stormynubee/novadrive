import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const STEPS = ['Locate', 'Triage', 'Route', 'Packet', 'Relay'] as const;
export type RailStep = (typeof STEPS)[number];

export function ProgressRail({ current }: { current: RailStep }) {
  const idx = STEPS.indexOf(current);
  return (
    <View style={styles.row}>
      {STEPS.map((s, i) => (
        <View key={s} style={styles.item}>
          <View style={[styles.dot, i <= idx && styles.dotActive]} />
          <Text style={[styles.text, i <= idx && styles.textActive]}>{s}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  item: { alignItems: 'center', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginBottom: 4 },
  dotActive: { backgroundColor: colors.amber },
  text: { color: colors.muted, fontSize: 10 },
  textActive: { color: colors.text, fontWeight: '600' },
});
