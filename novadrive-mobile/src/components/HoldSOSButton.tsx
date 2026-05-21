import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

const HOLD_MS = 1500;

export function HoldSOSButton({ onTrigger }: { onTrigger: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);

  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onTrigger();
      setHolding(false);
    }, HOLD_MS);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    setHolding(false);
  };

  return (
    <Pressable
      onPressIn={start}
      onPressOut={cancel}
      style={[styles.btn, holding && styles.holding]}
    >
      <Text style={styles.label}>{holding ? 'Keep holding…' : 'Hold for SOS'}</Text>
      <Text style={styles.sub}>1.5 seconds</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: colors.urgent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  holding: { opacity: 0.9, transform: [{ scale: 1.02 }] },
  label: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sub: { color: '#ffe4e6', fontSize: 12, marginTop: 4 },
});
