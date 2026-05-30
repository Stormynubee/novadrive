import { router } from 'expo-router';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { APP_DISPLAY_NAME } from '../lib/brand';
import { MargiLogoMark } from './MargiLogo';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

export function MargiTopBar({
  title = APP_DISPLAY_NAME,
  subtitle,
  onBack,
  showBack,
  onMenu,
  onEmergency,
  onTrailingIcon,
  trailingIcon,
  variant = 'primary',
  style,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  onMenu?: () => void;
  onEmergency?: () => void;
  onTrailingIcon?: () => void;
  trailingIcon?: keyof typeof MaterialIcons.glyphMap;
  variant?: 'primary' | 'surface';
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const onPrimary = variant === 'primary';
  const fg = onPrimary ? tokens.onPrimary : tokens.primary;

  return (
    <View
      style={[
        styles.bar,
        onPrimary ? styles.barPrimary : styles.barSurface,
        { paddingTop: insets.top + 10 },
        style,
      ]}
      pointerEvents="box-none"
    >
      {showBack ? (
        <Pressable
          onPress={onBack ?? (() => router.back())}
          style={[styles.iconBtn, styles.iconBtnRaised]}
          accessibilityLabel="Back"
        >
          <MaterialIcons name="arrow-back" size={24} color={fg} />
        </Pressable>
      ) : onMenu ? (
        <Pressable
          onPress={onMenu}
          style={[styles.iconBtn, styles.iconBtnRaised]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Menu"
        >
          <MaterialIcons name="menu" size={24} color={fg} />
        </Pressable>
      ) : (
        <View style={styles.brand}>
          <MargiLogoMark size={28} />
        </View>
      )}

      <View style={styles.titleWrap} pointerEvents="box-none">
        <HudText variant="headlineMd" style={[styles.title, { color: fg }]} numberOfLines={1}>
          {title}
        </HudText>
        {subtitle ? (
          <HudText
            variant="mono"
            style={[styles.sub, { color: onPrimary ? tokens.onPrimaryContainer : tokens.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {subtitle}
          </HudText>
        ) : null}
      </View>

      <View style={styles.trailing}>
        {trailingIcon && onTrailingIcon ? (
          <Pressable
            onPress={onTrailingIcon}
            style={[styles.iconBtn, styles.iconBtnRaised]}
            accessibilityLabel="Settings"
          >
            <MaterialIcons name={trailingIcon} size={24} color={fg} />
          </Pressable>
        ) : null}
        {onEmergency ? (
          <Pressable
            onPress={onEmergency}
            style={[styles.iconBtn, styles.iconBtnRaised]}
            accessibilityLabel="Emergency"
          >
            <MaterialIcons name="emergency-share" size={26} color={tokens.secondary} />
          </Pressable>
        ) : !trailingIcon ? (
          <View style={styles.iconBtn} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
  },
  barPrimary: { backgroundColor: tokens.primary },
  barSurface: {
    backgroundColor: tokens.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outlineVariant,
  },
  brand: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, minWidth: 0, pointerEvents: 'none' },
  iconBtnRaised: { zIndex: 10, elevation: 6 },
  title: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  sub: { fontSize: 10, marginTop: 2 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  trailing: { flexDirection: 'row', alignItems: 'center' },
});
