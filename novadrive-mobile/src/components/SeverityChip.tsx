import { StyleSheet, Text, View } from 'react-native';
import { TRIAGE_META } from '../lib/startTriageFSM';
import type { TriageColor } from '../lib/types';

export function SeverityChip({ triage }: { triage: TriageColor }) {
  const meta = TRIAGE_META[triage];
  return (
    <View style={[styles.chip, { borderColor: meta.color }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <View>
        <Text style={styles.label}>{meta.label}</Text>
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#151D2E',
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  label: { color: '#E8EDF4', fontWeight: '700', fontSize: 16 },
  sub: { color: '#8B9BB0', fontSize: 13, marginTop: 2 },
});
