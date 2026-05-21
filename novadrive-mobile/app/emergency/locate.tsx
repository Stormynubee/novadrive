import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';
import { NovaButton } from '../../src/components/NovaButton';
import { ProgressRail } from '../../src/components/ProgressRail';
import { ScreenShell } from '../../src/components/ScreenShell';
import { useApp } from '../../src/context/AppContext';
import { colors } from '../../src/theme/colors';

export default function LocateScreen() {
  const { setLocation, session } = useApp();
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission required.');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const fix = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy ?? undefined,
        nhCode: 'NH48',
        nhKm: 87,
        landmark: 'Chennai–Trichy corridor (demo)',
        capturedAt: new Date().toISOString(),
      };
      setLocation(fix);
      router.push('/emergency/triage');
    } catch (e) {
      Alert.alert('Location error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title="Locate" subtitle="Capture coordinates for Golden Hour Packet — works offline after fix.">
      <ProgressRail current="Locate" />
      {session.location ? (
        <Text style={styles.coords}>
          {session.location.lat.toFixed(5)}, {session.location.lng.toFixed(5)}
          {'\n'}
          {session.location.landmark}
        </Text>
      ) : (
        <Text style={styles.hint}>No location yet. Tap capture (airplane mode uses last GPS fix if available).</Text>
      )}
      {loading ? (
        <ActivityIndicator color={colors.amber} />
      ) : (
        <NovaButton label="Capture location" onPress={capture} />
      )}
      {session.location && (
        <NovaButton label="Continue to triage" onPress={() => router.push('/emergency/triage')} />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  coords: { color: colors.cyan, fontFamily: 'monospace', lineHeight: 22 },
  hint: { color: colors.muted },
});
