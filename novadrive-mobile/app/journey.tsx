import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CrashCandidateModal } from '../src/components/CrashCandidateModal';
import { HoldSOSButton } from '../src/components/HoldSOSButton';
import { NovaButton } from '../src/components/NovaButton';
import { ScreenShell } from '../src/components/ScreenShell';
import { useApp } from '../src/context/AppContext';
import { colors } from '../src/theme/colors';

export default function JourneyScreen() {
  const {
    journeyStatus,
    speedKmh,
    startJourney,
    endJourney,
    simulateCrash,
    crashDialogOpen,
    calmCountdown,
    dismissCrashDialog,
    confirmCrash,
    triggerSOS,
  } = useApp();
  const [starting, setStarting] = useState(false);

  const onStart = async () => {
    setStarting(true);
    try {
      await startJourney();
    } catch (e) {
      Alert.alert('Location needed', (e as Error).message);
    } finally {
      setStarting(false);
    }
  };

  const onSOS = () => {
    triggerSOS();
    router.push('/emergency/locate');
  };

  const onConfirmCrash = () => {
    confirmCrash();
    router.push('/emergency/locate');
  };

  return (
    <ScreenShell title="Journey HUD" subtitle="Foreground GPS only. CrashEngine active when journey is ACTIVE.">
      <View style={styles.hud}>
        <Text style={styles.speed}>{speedKmh}</Text>
        <Text style={styles.unit}>km/h</Text>
        <Text style={styles.status}>Status: {journeyStatus}</Text>
      </View>

      {journeyStatus !== 'ACTIVE' ? (
        <NovaButton label={starting ? 'Starting…' : 'Start journey'} onPress={onStart} disabled={starting} />
      ) : (
        <NovaButton label="End journey" onPress={endJourney} variant="secondary" />
      )}

      <HoldSOSButton onTrigger={onSOS} />

      <NovaButton
        label="Simulate crash (judges)"
        onPress={simulateCrash}
        variant="ghost"
      />

      <NovaButton label="Back home" onPress={() => router.back()} variant="secondary" />

      <CrashCandidateModal
        visible={crashDialogOpen}
        countdown={calmCountdown}
        onDismiss={dismissCrashDialog}
        onConfirm={onConfirmCrash}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hud: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  speed: { color: colors.amber, fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'] },
  unit: { color: colors.muted, fontSize: 16 },
  status: { color: colors.cyan, marginTop: 12, fontSize: 14 },
});
