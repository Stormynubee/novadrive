import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

export function NaariShaktiHero() {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <MaterialIcons name="verified-user" size={16} color={tokens.onSecondary} />
        <HudText variant="mono" style={styles.badgeText}>
          GOVERNMENT INITIATIVE
        </HudText>
      </View>
      <HudText variant="headlineLg" style={styles.title}>
        NAARI SHAKTI
      </HudText>
      <HudText variant="bodyMd" style={styles.sub}>
        Institutional Safety Protocol for Women Citizens. Vigilant. Reliable. Secure.
      </HudText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: tokens.primary,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderBottomWidth: 4,
    borderBottomColor: tokens.secondary,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: tokens.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: tokens.onSecondary,
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: 'PublicSans_700Bold',
  },
  title: {
    color: tokens.onPrimary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: -0.5,
  },
  sub: { color: 'rgba(255,255,255,0.82)', maxWidth: 360 },
});
