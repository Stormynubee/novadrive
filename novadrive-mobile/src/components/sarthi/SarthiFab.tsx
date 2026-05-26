import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../../theme/tokens';

const TAB_BAR_OFFSET = 72;

export function SarthiFab({
  onPress,
  visible,
  liftAboveGrid = false,
}: {
  onPress: () => void;
  visible: boolean;
  liftAboveGrid?: boolean;
}) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  const extraLift = liftAboveGrid ? 88 : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          bottom: insets.bottom + TAB_BAR_OFFSET + extraLift,
          right: tokens.spacing.sideMargin,
        },
        pressed && styles.pressed,
      ]}
      accessibilityLabel="Open Sarthi assistant"
    >
      <MaterialIcons name="shield" size={28} color={tokens.onSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    ...tokens.elevation.sos,
  },
  pressed: { transform: [{ scale: 0.96 }] },
});
