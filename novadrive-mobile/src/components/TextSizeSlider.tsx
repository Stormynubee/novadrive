import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';

export function TextSizeSlider({
  value,
  onChange,
  preview,
}: {
  value: number;
  onChange: (v: number) => void;
  preview: string;
}) {
  const pct = Math.round(value * 100);
  const step = (delta: number) =>
    onChange(Math.min(1.5, Math.max(0.8, Math.round((value + delta) * 20) / 20)));
  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Text style={styles.label}>Text size</Text>
        <Text style={styles.badge}>{pct}%</Text>
      </View>
      <View style={styles.stepRow}>
        <Pressable onPress={() => step(-0.05)} style={styles.stepBtn} accessibilityLabel="Decrease">
          <Text style={styles.stepTxt}>−</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((value - 0.8) / 0.7) * 100}%` }]} />
        </View>
        <Pressable onPress={() => step(0.05)} style={styles.stepBtn} accessibilityLabel="Increase">
          <Text style={styles.stepTxt}>+</Text>
        </Pressable>
      </View>
      <View style={styles.preview}>
        <Text style={[styles.previewText, { fontSize: 16 * value }]}>{preview}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: tokens.primary,
    fontSize: 16,
    fontFamily: 'HankenGrotesk_700Bold',
  },
  badge: {
    color: tokens.secondary,
    fontSize: 12,
    fontFamily: 'PublicSans_700Bold',
    backgroundColor: tokens.secondaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.surface,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTxt: {
    color: tokens.primary,
    fontSize: 22,
    fontFamily: 'HankenGrotesk_700Bold',
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: tokens.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: tokens.secondary },
  preview: {
    backgroundColor: tokens.surfaceContainerLow,
    padding: 16,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  previewText: { color: tokens.onSurface, fontFamily: 'PublicSans_400Regular' },
});
