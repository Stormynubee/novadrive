import { type Href, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MargiTopBar } from '../src/components/MargiTopBar';
import { NaariShaktiHero } from '../src/components/naari/NaariShaktiHero';
import { NaariEmergencyButton } from '../src/components/naari/NaariEmergencyButton';
import { NaariQuickActions } from '../src/components/naari/NaariQuickActions';
import { NaariSafetyToggle } from '../src/components/naari/NaariSafetyToggle';
import { NaariQuickMessage } from '../src/components/naari/NaariQuickMessage';
import { NaariCitizenStatus } from '../src/components/naari/NaariCitizenStatus';
import { NaariNearestSafetyPoint } from '../src/components/naari/NaariNearestSafetyPoint';
import { NaariEmergencyHud } from '../src/components/naari/NaariEmergencyHud';
import { useApp } from '../src/context/AppContext';
import { useNaariShakti } from '../src/context/NaariShaktiContext';
import { isNaariShaktiEligible } from '../src/lib/naariShakti/eligibility';
import { findNearestPoliceStation } from '../src/lib/naariShakti/stations';
import {
  dialWomensHelpline,
  openMapsNavigate,
  shareLiveLocation,
  smsNearestStation,
} from '../src/lib/naariShakti/linkingActions';
import { buildCommunityAlertBody } from '../src/lib/naariShakti/messages';
import { openSmsUrl } from '../src/lib/naariShakti/linkingActions';
import { tokens } from '../src/theme/tokens';

export default function NaariShaktiScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useApp();
  const {
    distressActive,
    activateDistress,
    cancelDistress,
    setSafetyMode,
    getCurrentCoords,
  } = useNaariShakti();
  const [quickMsg, setQuickMsg] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const safetyActive = profile.naariShakti?.safetyModeActive ?? false;
  const displayName = profile.name?.trim() || 'Citizen';

  useEffect(() => {
    if (!isNaariShaktiEligible(profile)) {
      router.replace('/(tabs)/explore' as Href);
    }
  }, [profile]);

  useEffect(() => {
    getCurrentCoords().then((c) => {
      if (c) setCoords(c);
    });
  }, [getCurrentCoords]);

  const station = useMemo(() => {
    const lat = coords?.lat ?? 12.9716;
    const lng = coords?.lng ?? 80.2206;
    return findNearestPoliceStation(lat, lng);
  }, [coords]);

  const runWithCoords = async (fn: (c: { lat: number; lng: number }) => Promise<void>) => {
    const c = coords ?? (await getCurrentCoords());
    if (!c) return;
    setCoords(c);
    await fn(c);
  };

  const sendQuickMessage = async () => {
    const text = quickMsg.trim();
    if (!text) {
      Alert.alert('Message empty', 'Type a message or tap a preset.');
      return;
    }
    const ice = profile.medical?.primaryContact?.phone?.trim();
    if (!ice) {
      Alert.alert('No ICE contact', 'Add a primary contact in Medical Profile.');
      return;
    }
    await runWithCoords(async (c) => {
      const body = buildCommunityAlertBody({
        userName: displayName,
        lat: c.lat,
        lng: c.lng,
        preset: text,
      });
      await openSmsUrl(ice, body);
    });
  };

  return (
    <View style={styles.root}>
      <MargiTopBar title="Margi" showBack />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <NaariShaktiHero />

        <View style={styles.section}>
          <View style={styles.emergencyCard}>
            <NaariEmergencyButton
              disabled={!safetyActive}
              onActivate={() => activateDistress()}
            />
          </View>

          <NaariQuickActions
            actions={[
              {
                id: 'sms',
                icon: 'local-police',
                title: 'SMS Nearest Station',
                subtitle: 'Silent distress alert',
                onPress: () => runWithCoords((c) => smsNearestStation(profile, c)),
              },
              {
                id: 'share',
                icon: 'share-location',
                title: 'Share Live Location',
                subtitle: 'Trusted contacts & Police',
                onPress: () => runWithCoords((c) => shareLiveLocation(profile, c)),
              },
              {
                id: 'helpline',
                icon: 'phone-in-talk',
                title: "Women's Helpline",
                subtitle: 'Dial 181 — national support',
                onPress: () => dialWomensHelpline(),
              },
            ]}
          />

          <NaariSafetyToggle
            active={safetyActive}
            onToggle={(next) => setSafetyMode(next)}
          />

          <NaariQuickMessage value={quickMsg} onChange={setQuickMsg} onSend={sendQuickMessage} />

          <View style={styles.bentoCol}>
            <NaariCitizenStatus
              displayName={displayName}
              verified={profile.gender === 'female'}
            />
            <NaariNearestSafetyPoint
              name={station.name}
              distanceKm={station.distanceKm}
              etaMinutes={station.etaMinutes}
              onNavigate={() => openMapsNavigate(station.lat, station.lng)}
            />
          </View>
        </View>
      </ScrollView>

      <NaariEmergencyHud visible={distressActive} onCancel={() => cancelDistress()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { flexGrow: 1 },
  section: { paddingHorizontal: 24, paddingTop: 16 },
  emergencyCard: {
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
    borderTopWidth: 4,
    borderTopColor: tokens.secondary,
    marginBottom: 8,
  },
  bentoCol: { flexDirection: 'column', gap: 12, marginTop: 16, width: '100%' },
});
