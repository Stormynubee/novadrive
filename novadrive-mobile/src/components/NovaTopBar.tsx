import { router } from 'expo-router';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

/**
 * Sticky navy app bar used by every dashboard tab and stack screen. Mirrors the Stitch
 * `nova_drive_phase_1_locate_header_standardized` chrome — primary navy background, small
 * shield emblem, NOVA DRIVE wordmark, optional saffron emergency_share trailing icon.
 */
export function NovaTopBar({
  title = 'NOVA DRIVE',
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
  /** When set, the saffron emergency_share button is shown and routes through this handler. */
  onEmergency?: () => void;
  onTrailingIcon?: () => void;
  trailingIcon?: keyof typeof MaterialIcons.glyphMap;
  /** "primary" = navy chrome (default). "surface" = white chrome with primary text. */
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
    >
      {showBack ? (
        <Pressable
          onPress={onBack ?? (() => router.back())}
          style={styles.iconBtn}
          accessibilityLabel="Back"
        >
          <MaterialIcons name="arrow-back" size={24} color={fg} />
        </Pressable>
      ) : onMenu ? (
        <Pressable onPress={onMenu} style={styles.iconBtn} accessibilityLabel="Menu">
          <MaterialIcons name="menu" size={24} color={fg} />
        </Pressable>
      ) : (
        <View style={styles.brand}>
          <View style={[styles.shield, { borderColor: onPrimary ? 'rgba(255,255,255,0.18)' : tokens.primary }]}>
            <MaterialIcons name="shield" size={18} color={tokens.secondary} />
          </View>
        </View>
      )}

      <View style={styles.titleWrap}>
        <HudText
          variant="headlineMd"
          style={[
            styles.title,
            { color: fg },
          ]}
          numberOfLines={1}
        >
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
            style={styles.iconBtn}
            accessibilityLabel="Settings"
          >
            <MaterialIcons name={trailingIcon} size={24} color={fg} />
          </Pressable>
        ) : null}
        {onEmergency ? (
          <Pressable
            onPress={onEmergency}
            style={styles.iconBtn}
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
  barPrimary: {
    backgroundColor: tokens.primary,
  },
  barSurface: {
    backgroundColor: tokens.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outlineVariant,
  },
  brand: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  shield: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  titleWrap: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 1.1,
  },
  sub: { fontSize: 10, marginTop: 2 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  trailing: { flexDirection: 'row', alignItems: 'center' },
});
