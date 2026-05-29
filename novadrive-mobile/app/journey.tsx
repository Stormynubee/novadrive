import { type Href, router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrivingHudLayout } from '../src/components/driving/DrivingHudLayout';
import { HudText } from '../src/components/HudText';
import { ScreenEnter } from '../src/components/ScreenEnter';
import { useApp } from '../src/context/AppContext';
import { EMERGENCY_SELECTION_PATH } from '../src/lib/emergency/emergencyNavigation';
import { openEmergencySmsIntent } from '../src/lib/emergencySms';
import { tokens } from '../src/theme/tokens';

/**
 * Margi drive HUD (v1.6) — fixed layout: SOS top, compact speedometer, no scroll while driving.
 */
export default function JourneyScreen() {
  const {
    journeyStatus,
    speedKmh,
    finishJourney,
    simulateCrash,
    simulatePanic,
    voiceMonitoring,
    triggerSOS,
    beginEmergencyFlow,
  } = useApp();

  const onSOS = () => {
    triggerSOS();
    beginEmergencyFlow();
    void openEmergencySmsIntent('sos_hold');
    router.push(EMERGENCY_SELECTION_PATH as Href);
  };

  const live = journeyStatus === 'ACTIVE';

  const confirmExit = () => {
    Alert.alert('Exit drive mode?', undefined, [
      { text: 'Stay on HUD', style: 'cancel' },
      {
        text: 'Exit to Home',
        style: 'destructive',
        onPress: async () => {
          await finishJourney();
          router.replace('/(tabs)/explore' as Href);
        },
      },
      {
        text: 'End trip & summary',
        onPress: async () => {
          const id = await finishJourney();
          router.replace({
            pathname: '/journey/complete',
            params: id ? { id } : {},
          } as Href);
        },
      },
    ]);
  };

  const onEndJourney = async () => {
    const id = await finishJourney();
    router.replace({
      pathname: '/journey/complete',
      params: id ? { id } : {},
    } as Href);
  };

  return (
    <ScreenEnter variant="fade">
      <DrivingHudLayout
        speedKmh={speedKmh}
        journeyActive={live}
        voiceMonitoring={voiceMonitoring}
        onMenu={confirmExit}
        onEmergencyShare={() => {
          beginEmergencyFlow();
          router.push(EMERGENCY_SELECTION_PATH as Href);
        }}
        onSOS={onSOS}
        footer={
          <>
            <Pressable onPress={onEndJourney} style={styles.endTripBtn}>
              <MaterialIcons name="flag" size={18} color={tokens.onPrimary} />
              <HudText variant="bodyMd" style={styles.endTripLabel}>
                End trip & view summary
              </HudText>
            </Pressable>
            {__DEV__ ? (
              <View style={styles.demoRow}>
                <Pressable onPress={simulateCrash} style={styles.demoPill}>
                  <MaterialIcons name="science" size={14} color={tokens.primary} />
                  <HudText variant="mono" style={styles.demoText}>
                    Test impact
                  </HudText>
                </Pressable>
                <Pressable onPress={simulatePanic} style={styles.demoPill}>
                  <MaterialIcons name="record-voice-over" size={14} color={tokens.primary} />
                  <HudText variant="mono" style={styles.demoText}>
                    Test scream
                  </HudText>
                </Pressable>
              </View>
            ) : null}
          </>
        }
      />
    </ScreenEnter>
  );
}

const styles = StyleSheet.create({
  endTripBtn: {
    height: 48,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  endTripLabel: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  demoText: { fontSize: 10, color: tokens.primary, letterSpacing: 0.6 },
});
