import { Pressable, StyleSheet } from 'react-native';
import type { FSMContext } from '../lib/startTriageFSM';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

export function AnswerChips({
  options,
  onSelect,
}: {
  options: { id: string; label: string; value: Partial<FSMContext> }[];
  onSelect: (value: Partial<FSMContext>) => void;
}) {
  return (
    <>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          onPress={() => onSelect(opt.value)}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={opt.label}
        >
          <HudText variant="bodyMd" style={styles.label}>
            {opt.label}
          </HudText>
        </Pressable>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    minWidth: 96,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.surface,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: tokens.secondaryFixed,
    borderColor: tokens.secondary,
  },
  label: { fontFamily: 'PublicSans_700Bold', color: tokens.primary },
});
