import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GovSwitch } from './GovSwitch';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

export function AccessibilityToggleCard({
  icon,
  title,
  description,
  value,
  onValueChange,
  activeIconBg = true,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  activeIconBg?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={[styles.iconWrap, !activeIconBg && styles.iconWrapMuted]}>
          <MaterialIcons
            name={icon}
            size={22}
            color={activeIconBg ? tokens.primary : tokens.onSurfaceVariant}
          />
        </View>
        <View style={styles.copy}>
          <HudText variant="bodyMd" style={styles.title}>
            {title}
          </HudText>
          <HudText variant="bodySm" style={styles.desc}>
            {description}
          </HudText>
        </View>
      </View>
      <GovSwitch value={value} onValueChange={onValueChange} accessibilityLabel={title} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    padding: 16,
    minHeight: 88,
    gap: 12,
    ...tokens.elevation.card,
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapMuted: {
    backgroundColor: tokens.surfaceContainerHigh,
  },
  copy: { flex: 1, paddingRight: 4 },
  title: { color: tokens.onSurface, fontFamily: 'PublicSans_700Bold', fontSize: 17 },
  desc: { color: tokens.onSurfaceVariant, marginTop: 4, lineHeight: 20 },
});
