import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { EmergencyStepShell } from '../../src/components/EmergencyStepShell';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { LiveChip } from '../../src/components/LiveChip';
import { MargiButton } from '../../src/components/MargiButton';
import { useApp } from '../../src/context/AppContext';
import { EMERGENCY_ACTIVATION_PATH } from '../../src/lib/emergency/emergencyNavigation';
import { reverseGeocodePlace } from '../../src/lib/geocode';
import { tokens } from '../../src/theme/tokens';

/**
 * Stitch `nova_drive_phase_1_locate_header_standardized` — Phase 1 of the emergency stepper.
 * Captures GPS + reverse-geocoded landmark, persists in `session.location` for use by the rest
 * of the flow (Triage → Route → Packet → Relay).
 */
export default function LocateScreen() {
  const { setLocation, session } = useApp();
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission required.');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { landmark } = await reverseGeocodePlace(pos.coords.latitude, pos.coords.longitude);
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy ?? undefined,
        landmark,
        capturedAt: new Date().toISOString(),
      });
    } catch (e) {
      Alert.alert('Location error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      {loading ? <ActivityIndicator color={tokens.primary} /> : null}
      {!session.location ? (
        <MargiButton
          label="Capture location"
          onPress={capture}
          variant="secondary"
          large
          disabled={loading}
        />
      ) : (
        <>
          <MargiButton
            label="Continue to activation"
            onPress={() => router.push(EMERGENCY_ACTIVATION_PATH as Href)}
            variant="secondary"
            large
          />
          <MargiButton label="Recapture" onPress={capture} variant="ghost" disabled={loading} />
        </>
      )}
    </>
  );

  return (
    <EmergencyStepShell
      step="Locate"
      title="Pin your location"
      subtitle="We need your position for 108 dispatch and the Golden Hour Packet."
      showBack
      footer={footer}
    >
      <View style={styles.mapStrip}>
        <View style={styles.mapTile}>
          <MaterialIcons name="my-location" size={28} color={tokens.secondary} />
          <HudText variant="mono" style={styles.mapLabel}>
            {session.location ? 'GPS LOCKED' : 'AWAITING FIX'}
          </HudText>
        </View>
        <View style={styles.gridLines} />
      </View>

      <HudCard accent={session.location ? 'tertiary' : 'primary'}>
        {session.location ? (
          <>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: tokens.tertiaryContainer }]}>
                <MaterialIcons name="place" size={20} color={tokens.tertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <HudText variant="mono" style={styles.kicker}>
                  COORDINATES
                </HudText>
                <HudText variant="headlineMd" style={styles.coords}>
                  {session.location.lat.toFixed(5)}, {session.location.lng.toFixed(5)}
                </HudText>
              </View>
              {session.location.accuracyMeters != null ? (
                <LiveChip
                  label={`±${Math.round(session.location.accuracyMeters)} m`}
                  tone="safe"
                />
              ) : null}
            </View>
            <View style={styles.divider} />
            <HudText variant="mono" style={styles.kicker}>
              NEAREST LANDMARK
            </HudText>
            <HudText variant="bodyMd" style={styles.place}>
              {session.location.landmark}
            </HudText>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: tokens.primaryFixed }]}>
                <MaterialIcons name="my-location" size={20} color={tokens.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <HudText variant="bodyMd" style={styles.title}>
                  No fix yet
                </HudText>
                <HudText variant="bodySm" style={styles.hint}>
                  One capture works offline afterward (airplane mode reuses the last fix).
                </HudText>
              </View>
            </View>
          </>
        )}
      </HudCard>
    </EmergencyStepShell>
  );
}

const styles = StyleSheet.create({
  mapStrip: {
    height: 96,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.primaryFixed,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapTile: {
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    backgroundColor: 'transparent',
    borderColor: tokens.outlineVariant,
    borderWidth: 0.5,
  },
  mapLabel: { color: tokens.primary, letterSpacing: 1.4, fontSize: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.iconWrap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: { fontSize: 10, color: tokens.onSurfaceVariant, letterSpacing: 1.2 },
  coords: { color: tokens.primary, marginTop: 2, fontFamily: 'HankenGrotesk_700Bold' },
  title: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  hint: { color: tokens.onSurfaceVariant, marginTop: 4, lineHeight: 20 },
  place: { color: tokens.primary, marginTop: 4, lineHeight: 22 },
  divider: { height: 1, backgroundColor: tokens.outlineVariant, marginVertical: 12 },
});
