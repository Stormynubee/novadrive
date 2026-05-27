import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function SafetyBriefCard({ icon, title, subtitle, onPress, accessibilityLabel }: Props) {
  const body = (
    <>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.textCol}>
        <HudText variant="bodyMd" style={styles.title}>
          {title}
        </HudText>
        <HudText variant="bodySm" style={styles.subtitle}>
          {subtitle}
        </HudText>
      </View>
    </>
  );

  if (!onPress) {
    return <View style={styles.card}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    ...tokens.elevation.card,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  iconWrap: { flexShrink: 0 },
  textCol: { flex: 1, minWidth: 0, gap: 4 },
  title: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  subtitle: { color: tokens.onSurfaceVariant, lineHeight: 20 },
});
