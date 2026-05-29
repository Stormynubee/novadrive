import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { DashboardHeader } from '../../src/components/DashboardHeader';
import { HomePrimaryStack } from '../../src/components/home/HomePrimaryStack';
import { DailySafetyBriefSection } from '../../src/components/home/DailySafetyBriefSection';
import { HudText } from '../../src/components/HudText';
import { NaariShaktiProtocolModal } from '../../src/components/naari/NaariShaktiProtocolModal';
import { useApp } from '../../src/context/AppContext';
import { useNaariShakti } from '../../src/context/NaariShaktiContext';
import { EMERGENCY_SELECTION_PATH } from '../../src/lib/emergency/emergencyNavigation';
import { openEmergencySmsIntent } from '../../src/lib/emergencySms';
import { runQuickSos } from '../../src/lib/home/quickSos';
import {
  isNaariShaktiEligible,
  shouldShowProtocolModal,
} from '../../src/lib/naariShakti/eligibility';
import { tokens } from '../../src/theme/tokens';

const APP_VERSION = Constants.expoConfig?.version ?? '2.0.0';

/**
 * Home tab — Stitch dashboard: Drive Mode, Naari Shakti, Bystander QR, Quick SOS,
 * Report Hazard, Daily Safety Brief.
 */
export default function HomeTabScreen() {
  const { profile, beginEmergencyFlow } = useApp();
  const { enablePortal, dismissProtocol } = useNaariShakti();
  const [protocolVisible, setProtocolVisible] = useState(false);
  const showNaari = isNaariShaktiEligible(profile);

  const openNaari = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    if (shouldShowProtocolModal(profile)) {
      setProtocolVisible(true);
      return;
    }
    router.push('/naari-shakti' as Href);
  };

  const onEnablePortal = async () => {
    await enablePortal();
    setProtocolVisible(false);
    router.push('/naari-shakti' as Href);
  };

  const onDismissProtocol = async () => {
    await dismissProtocol();
    setProtocolVisible(false);
  };

  const enterDrive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    router.replace('/(tabs)/drive' as Href);
  };

  return (
    <View style={styles.root}>
      <DashboardHeader />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.watermark}>
          <MaterialIcons name="verified-user" size={280} color={tokens.primary} />
        </View>

        <View style={styles.statusBanner}>
          <MaterialIcons name="check-circle" size={22} color={tokens.primary} />
          <View style={{ flex: 1 }}>
            <HudText variant="bodyMd" style={styles.statusTitle}>
              System Ready
            </HudText>
            <HudText variant="bodySm" style={styles.statusSub}>
              All sensors operational. GPS locked.
            </HudText>
          </View>
          <HudText variant="mono" style={styles.version}>
            V {APP_VERSION}
          </HudText>
        </View>

        <HomePrimaryStack
          onEnterDrive={enterDrive}
          onNaariPress={showNaari ? openNaari : undefined}
          showNaari={showNaari}
        />

        <Pressable
          style={({ pressed }) => [styles.fullTile, pressed && styles.pressed]}
          onPress={() => router.push('/scan')}
        >
          <View style={styles.qrIconWrap}>
            <MaterialIcons name="qr-code-scanner" size={28} color={tokens.primary} />
          </View>
          <HudText variant="bodyMd" style={styles.qrLabel}>
            Bystander QR
          </HudText>
        </Pressable>

        <View style={styles.secondaryGrid}>
          <Pressable
            style={({ pressed }) => [styles.secondaryTile, styles.sosTile, pressed && styles.pressed]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
                () => undefined
              );
              runQuickSos(() => {
                beginEmergencyFlow();
                void openEmergencySmsIntent('sos_hold');
                router.push(EMERGENCY_SELECTION_PATH as Href);
              });
            }}
          >
            <View style={styles.sosIconWrap}>
              <MaterialIcons name="sos" size={28} color={tokens.error} />
            </View>
            <HudText variant="bodyMd" style={styles.sosLabel}>
              Quick SOS
            </HudText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryTile, pressed && styles.pressed]}
            onPress={() => router.push('/journey/feedback?hazard=1' as Href)}
          >
            <View style={styles.hazardIconWrap}>
              <MaterialIcons name="report-problem" size={28} color={tokens.primary} />
            </View>
            <HudText variant="bodyMd" style={styles.hazardLabel}>
              Report Hazard
            </HudText>
          </Pressable>
        </View>

        <DailySafetyBriefSection active />
      </ScrollView>

      {showNaari ? (
        <NaariShaktiProtocolModal
          visible={protocolVisible}
          onEnable={onEnablePortal}
          onDismiss={onDismissProtocol}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 140,
    paddingTop: 16,
    alignItems: 'center',
    gap: 16,
  },
  watermark: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.03,
    pointerEvents: 'none',
  },
  statusBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.surfaceContainer,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 12,
    zIndex: 1,
  },
  statusTitle: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  statusSub: { color: tokens.onSurfaceVariant, marginTop: 2 },
  version: { fontSize: 11, color: tokens.onSurfaceVariant },
  fullTile: {
    width: '100%',
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 10,
    zIndex: 1,
    ...tokens.elevation.card,
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    zIndex: 1,
  },
  secondaryTile: {
    flex: 1,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 10,
    ...tokens.elevation.card,
  },
  sosTile: { borderColor: 'rgba(186,26,26,0.25)' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  sosIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hazardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosLabel: { color: tokens.error, fontFamily: 'PublicSans_700Bold' },
  qrLabel: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  hazardLabel: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
});
