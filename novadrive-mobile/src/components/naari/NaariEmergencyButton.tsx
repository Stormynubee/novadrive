import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';
import { createHoldTimer, NAARI_HOLD_MS } from '../../lib/naariShakti/holdTimer';

type Props = {
  disabled?: boolean;
  onActivate: () => void;
};

export function NaariEmergencyButton({ disabled, onActivate }: Props) {
  const holdRef = useRef(createHoldTimer(NAARI_HOLD_MS, () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    onActivate();
  }));

  useEffect(() => {
    const timer = holdRef.current;
    return () => timer.cancel();
  }, []);

  return (
    <View style={styles.wrap}>
      <Pressable
        disabled={disabled}
        onPressIn={() => {
          if (disabled) return;
          holdRef.current.start();
        }}
        onPressOut={() => holdRef.current.cancel()}
        style={({ pressed }) => [
          styles.btn,
          disabled && styles.btnDisabled,
          pressed && !disabled && styles.btnPressed,
        ]}
        accessibilityLabel="Emergency help. Press and hold for two seconds."
      >
        <MaterialIcons name="emergency" size={64} color={tokens.onSecondary} />
        <HudText variant="bodyMd" style={styles.btnLabel}>
          EMERGENCY HELP
        </HudText>
      </Pressable>
      <HudText variant="bodyMd" style={styles.holdHint}>
        Press & Hold for 2 Seconds
      </HudText>
      <HudText variant="bodySm" style={styles.holdSub}>
        Immediate deployment of nearby responders
      </HudText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 24 },
  btn: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: tokens.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: tokens.surfaceContainerHighest,
    shadowColor: tokens.secondaryContainer,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    gap: 4,
  },
  btnDisabled: { opacity: 0.45 },
  btnPressed: { transform: [{ scale: 0.92 }] },
  btnLabel: {
    color: tokens.onSecondary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 2,
    fontSize: 12,
  },
  holdHint: {
    marginTop: 16,
    color: tokens.secondary,
    fontFamily: 'PublicSans_700Bold',
    textAlign: 'center',
  },
  holdSub: { marginTop: 4, color: tokens.onSurfaceVariant, textAlign: 'center' },
});
