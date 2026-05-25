import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { SarthiGreetingBridge } from '../../src/components/sarthi/SarthiGreetingBridge';
import { DashboardHeader } from '../../src/components/DashboardHeader';
import { DriveModeIgnition } from '../../src/components/DriveModeIgnition';
import { HudText } from '../../src/components/HudText';
import { useApp } from '../../src/context/AppContext';
import { tokens } from '../../src/theme/tokens';

const APP_VERSION = Constants.expoConfig?.version ?? '2.1.4';

/**
 * Home tab — Stitch `nova_drive_driving_dashboard_animated_icon`.
 * System ready banner, animated ENTER DRIVE MODE, Quick SOS + Bystander QR.
 */
export default function HomeTabScreen() {
  const { beginEmergencyFlow } = useApp();

  const enterDrive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    router.replace('/(tabs)/drive' as Href);
  };

  return (
    <View style={styles.root}>
      <DashboardHeader />
      <SarthiGreetingBridge />
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

        <DriveModeIgnition onPress={enterDrive} />

        <View style={styles.secondaryGrid}>
          <Pressable
            style={({ pressed }) => [styles.secondaryTile, styles.sosTile, pressed && styles.pressed]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
              beginEmergencyFlow();
              router.push('/emergency/locate' as Href);
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
            onPress={() => router.push('/scan')}
          >
            <View style={styles.qrIconWrap}>
              <MaterialIcons name="qr-code-scanner" size={28} color={tokens.primary} />
            </View>
            <HudText variant="bodyMd" style={styles.qrLabel}>
              Bystander QR
            </HudText>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.sarthiTile, pressed && styles.pressed]}
          onPress={() => router.push('/sarthi' as Href)}
        >
          <View style={styles.sarthiIconWrap}>
            <MaterialIcons name="shield" size={26} color={tokens.onSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <HudText variant="bodyMd" style={styles.sarthiLabel}>
              Ask Sarthi
            </HudText>
            <HudText variant="bodySm" style={styles.sarthiSub}>
              AI assistant · Powered by NovaDrive
            </HudText>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={tokens.onSurfaceVariant} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 16,
    alignItems: 'center',
    gap: 24,
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
  sosLabel: { color: tokens.error, fontFamily: 'PublicSans_700Bold' },
  qrLabel: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  sarthiTile: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    paddingVertical: 14,
    paddingHorizontal: 14,
    zIndex: 1,
    ...tokens.elevation.card,
  },
  sarthiIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sarthiLabel: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  sarthiSub: { color: tokens.onSurfaceVariant, marginTop: 2 },
});
