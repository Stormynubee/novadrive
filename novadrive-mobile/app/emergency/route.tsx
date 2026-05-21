import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NovaButton } from '../../src/components/NovaButton';
import { ProgressRail } from '../../src/components/ProgressRail';
import { ScreenShell } from '../../src/components/ScreenShell';
import { useApp } from '../../src/context/AppContext';
import { rankFacilities } from '../../src/lib/facilitiesDb';
import type { Facility } from '../../src/lib/types';
import { colors } from '../../src/theme/colors';

export default function RouteScreen() {
  const { session, selectFacility, triageResult } = useApp();
  const [list, setList] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session.location || !triageResult) return;
    rankFacilities(triageResult, session.location.lat, session.location.lng).then((f) => {
      setList(f);
      setLoading(false);
    });
  }, [session.location, triageResult]);

  if (triageResult === 'BLACK') {
    return (
      <ScreenShell title="Route" subtitle="Notify 108 / police. No hospital routing for BLACK tag.">
        <ProgressRail current="Route" />
        <NovaButton label="Build packet anyway" onPress={() => router.push('/emergency/packet')} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Trauma-tier routing" subtitle="Not nearest pin — tier-matched from offline SQLite POIs.">
      <ProgressRail current="Route" />
      {loading ? (
        <ActivityIndicator color={colors.amber} />
      ) : (
        list.map((f) => (
          <Pressable
            key={f.id}
            style={[styles.card, f.recommended && styles.recommended]}
            onPress={() => {
              selectFacility(f);
              router.push('/emergency/packet');
            }}
          >
            <Text style={styles.name}>
              {f.name} {f.recommended ? '★' : ''}
            </Text>
            <Text style={styles.meta}>
              {f.type} · tier {f.traumaTier} · {f.distanceKm.toFixed(1)} km · ~{f.etaMinutes} min
            </Text>
            <Text style={styles.phone}>Phone: {f.phone}</Text>
            {!f.verified && <Text style={styles.warn}>Phone unverified — confirm before calling</Text>}
          </Pressable>
        ))
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recommended: { borderColor: colors.amber },
  name: { color: colors.text, fontWeight: '700', fontSize: 16 },
  meta: { color: colors.muted, marginTop: 4 },
  phone: { color: colors.cyan, marginTop: 6 },
  warn: { color: colors.urgent, fontSize: 12, marginTop: 4 },
});
