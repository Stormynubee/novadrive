import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';

/** Stitch-style navy toggle (56×32) with optional check when on. */
export function GovSwitch({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, value ? styles.trackOn : null]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : null]}>
        {value ? (
          <MaterialIcons name="check" size={14} color={tokens.primary} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.outlineVariant,
    justifyContent: 'center',
    padding: 3,
  },
  trackOn: {
    backgroundColor: tokens.primary,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 3,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.elevation.card,
  },
  thumbOn: {},
});
