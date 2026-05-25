import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

export function QrQuietZone({ children }: { children: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.zone}>{children}</View>
      <HudText variant="mono" style={styles.caption}>
        Bystander scan
      </HudText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  zone: {
    padding: 18,
    backgroundColor: '#ffffff',
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    ...tokens.elevation.card,
  },
  caption: { fontSize: 10, color: tokens.onSurfaceVariant },
});
