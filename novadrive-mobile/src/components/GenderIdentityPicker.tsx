import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HudText } from './HudText';
import type { GenderIdentity } from '../lib/types';
import { tokens } from '../theme/tokens';
import { genderChipActiveStyle, genderChipPressedStyle } from './margiButtonStyles';

const OPTIONS: { value: GenderIdentity; label: string; icon: string }[] = [
  { value: 'female', label: 'Female', icon: '♀' },
  { value: 'male', label: 'Male', icon: '♂' },
  { value: 'other', label: 'Other', icon: '⚧' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '—' },
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
              onChange(opt.value);
            }}
            style={({ pressed }) => [
              styles.chip,
              active && genderChipActiveStyle(),
              pressed && !active && genderChipPressedStyle(),
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            {/* Selection indicator dot */}
            {active && <View style={styles.selectionDot} />}

            <HudText
              variant="mono"
              style={[styles.icon, active && styles.iconActive]}
            >
              {opt.icon}
            </HudText>
            <HudText
              variant="mono"
              style={[styles.label, active && styles.labelActive]}
            >
              {opt.label}
            </HudText>
            {active && (
              <HudText variant="mono" style={styles.checkmark}>✓</HudText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.button,
    borderWidth: 1.5,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
    position: 'relative',
  },
  selectionDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.secondary, // saffron accent dot on selected
  },
  icon: {
    fontSize: 14,
    color: tokens.onSurfaceVariant,
  },
  iconActive: {
    color: tokens.onPrimary,
  },
  label: {
    color: tokens.primary,
    fontFamily: 'PublicSans_600SemiBold',
    fontSize: 12,
  },
  labelActive: {
    color: tokens.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
  checkmark: {
    fontSize: 11,
    color: tokens.secondary, // saffron checkmark for premium "confirmed" feel
    fontWeight: '700',
    marginLeft: 2,
  },
});
