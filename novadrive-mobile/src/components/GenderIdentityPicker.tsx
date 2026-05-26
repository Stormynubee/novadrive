import { Pressable, StyleSheet, View } from 'react-native';
import { HudText } from './HudText';
import type { GenderIdentity } from '../lib/types';
import { tokens } from '../theme/tokens';

const OPTIONS: { value: GenderIdentity; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

type Props = {
  value?: GenderIdentity;
  onChange: (gender: GenderIdentity) => void;
};

export function GenderIdentityPicker({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <HudText variant="bodyMd" style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </HudText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.input,
    borderWidth: 1.5,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
  },
  chipActive: {
    borderColor: tokens.secondaryContainer,
    backgroundColor: tokens.secondaryContainer,
  },
  label: { color: tokens.primary, fontFamily: 'PublicSans_600SemiBold' },
  labelActive: { color: tokens.onSecondary },
});
