import { Pressable, StyleSheet, View } from 'react-native';
import { HudText } from '../HudText';
import type { Lang } from '../../lib/types';
import { tokens } from '../../theme/tokens';

const OPTIONS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'ENGLISH' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
];

export function LanguageSelector({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (value: Lang) => void;
}) {
  return (
    <View style={styles.wrap}>
      <HudText variant="mono" style={styles.label}>
        EMERGENCY VOICE ASSIST LANGUAGE
      </HudText>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = option.code === value;
          return (
            <Pressable
              key={option.code}
              onPress={() => onChange(option.code)}
              style={[styles.option, active && styles.optionActive]}
            >
              <HudText variant="bodySm" style={[styles.optionText, active && styles.optionTextActive]}>
                {option.label}
              </HudText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.surfaceContainer,
    padding: 12,
    gap: 10,
  },
  label: {
    textAlign: 'center',
    color: tokens.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 1.1,
    fontFamily: 'PublicSans_700Bold',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  option: {
    minWidth: 96,
    minHeight: 42,
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  optionActive: {
    borderColor: tokens.primary,
    backgroundColor: tokens.primary,
  },
  optionText: {
    color: tokens.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  optionTextActive: {
    color: tokens.onPrimary,
  },
});
