import { StyleSheet, View } from 'react-native';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

export function LiveChip({
  label = 'Co-pilot ready',
  tone = 'safe',
}: {
  label?: string;
  tone?: 'safe' | 'warn' | 'info';
}) {
  const palette =
    tone === 'warn'
      ? { fg: tokens.secondary, bg: tokens.secondaryFixed }
      : tone === 'info'
        ? { fg: tokens.primary, bg: tokens.primaryFixed }
        : { fg: tokens.tertiary, bg: tokens.tertiaryContainer };
  return (
    <View style={[styles.chip, { backgroundColor: palette.bg, borderColor: palette.fg }]}>
      <View style={[styles.dot, { backgroundColor: palette.fg }]} />
      <HudText variant="mono" style={[styles.label, { color: palette.fg }]}>
        {label}
      </HudText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tokens.radius.chip,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 10, letterSpacing: 0.8 },
});
