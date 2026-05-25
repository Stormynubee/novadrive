import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useSarthi } from '../../context/SarthiContext';
import { announceA11y } from '../../lib/a11yRuntime';
import { buildSarthiUserContext } from '../../lib/sarthi/buildSarthiContext';
import { getDashboardGreeting } from '../../lib/sarthi/sarthiStrings';
import {
  markDashboardGreetingShown,
  shouldShowDashboardGreeting,
} from '../../lib/sarthi/sarthiSession';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

/**
 * Once per app session, when Home (explore) tab gains focus, show Sarthi greeting.
 */
export function SarthiGreetingBridge() {
  const { profile, journeyStatus, a11y } = useApp();
  const { refreshWelcomeIfNeeded } = useSarthi();
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerText, setBannerText] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!shouldShowDashboardGreeting()) return;
      const ctx = buildSarthiUserContext(
        profile,
        journeyStatus === 'ACTIVE' ? 'ACTIVE' : 'IDLE'
      );
      const message = getDashboardGreeting(ctx);
      setBannerText(message);
      setBannerVisible(true);
      announceA11y(message, a11y);
      refreshWelcomeIfNeeded();
      markDashboardGreetingShown();

      const timer = setTimeout(() => setBannerVisible(false), 6000);
      return () => clearTimeout(timer);
    }, [profile, journeyStatus, a11y, refreshWelcomeIfNeeded])
  );

  if (!bannerVisible) return null;

  return (
    <View style={styles.banner}>
      <MaterialIcons name="shield" size={20} color={tokens.secondary} />
      <HudText variant="bodyMd" style={styles.bannerText}>
        Sarthi — {bannerText}
      </HudText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: tokens.spacing.gutter,
    marginBottom: tokens.spacing.base,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: tokens.secondaryFixed,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    zIndex: 2,
  },
  bannerText: { flex: 1, color: tokens.onSurface },
});
