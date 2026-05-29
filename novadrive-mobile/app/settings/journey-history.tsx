import { type Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiTopBar } from '../../src/components/MargiTopBar';
import { getJourneyLog, listRecentJourneys, type JourneyLog } from '../../src/lib/journeyDb';
import { tokens } from '../../src/theme/tokens';

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function JourneyHistoryScreen() {
  const [journeys, setJourneys] = useState<JourneyLog[]>([]);
  const [selected, setSelected] = useState<JourneyLog | null>(null);

  useEffect(() => {
    listRecentJourneys().then(setJourneys);
  }, []);

  const openDebrief = async (id: string) => {
    const log = await getJourneyLog(id);
    setSelected(log);
  };

  return (
    <View style={styles.root}>
      <MargiTopBar title="Journey history" subtitle="Read-only debrief" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        {journeys.length === 0 ? (
          <HudCard accent="primary">
            <HudText variant="bodyMd" style={styles.empty}>
              Complete a corridor trip to see manifests here.
            </HudText>
          </HudCard>
        ) : (
          journeys.map((j) => (
            <Pressable key={j.id} onPress={() => openDebrief(j.id)}>
              <HudCard accent="primary">
                <HudText variant="bodyMd" style={styles.dest}>
                  {j.destination}
                </HudText>
                <HudText variant="bodySm" style={styles.meta}>
                  {formatWhen(j.endedAt ?? j.startedAt)} · {Math.round(j.maxSpeedKmh)} km/h peak
                </HudText>
                <View style={styles.flags}>
                  <HudText variant="mono" style={styles.flag}>
                    Impact {j.impactAlerts}
                  </HudText>
                  <HudText variant="mono" style={styles.flag}>
                    Voice {j.voiceAlerts}
                  </HudText>
                </View>
              </HudCard>
            </Pressable>
          ))
        )}

        {selected ? (
          <HudCard accent="tertiary">
            <HudText variant="mono" style={styles.kicker}>
              DEBRIEF
            </HudText>
            <HudText variant="headlineMd" style={styles.dest}>
              {selected.destination}
            </HudText>
            {selected.summaryJson ? (
              <>
                <HudText variant="bodySm" style={styles.meta}>
                  Route: {selected.summaryJson.routeContext}
                </HudText>
                <HudText variant="bodySm" style={styles.meta}>
                  Incidents — impact {selected.summaryJson.incidents.impact}, voice{' '}
                  {selected.summaryJson.incidents.voice}
                </HudText>
                {selected.summaryJson.feedbackNote ? (
                  <HudText variant="bodyMd" style={styles.note}>
                    {selected.summaryJson.feedbackNote}
                  </HudText>
                ) : null}
              </>
            ) : (
              <HudText variant="bodySm" style={styles.meta}>
                No saved summary JSON — open full complete screen for this trip.
              </HudText>
            )}
            <Pressable
              style={styles.linkRow}
              onPress={() =>
                router.push({ pathname: '/journey/complete', params: { id: selected.id } } as Href)
              }
            >
              <HudText variant="bodySm" style={styles.link}>
                Open full summary
              </HudText>
              <MaterialIcons name="chevron-right" size={20} color={tokens.primary} />
            </Pressable>
          </HudCard>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, gap: 12, paddingBottom: 48 },
  empty: { color: tokens.onSurfaceVariant, lineHeight: 22 },
  dest: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  meta: { color: tokens.onSurfaceVariant, marginTop: 4 },
  flags: { flexDirection: 'row', gap: 12, marginTop: 8 },
  flag: { fontSize: 10, color: tokens.secondary },
  kicker: { fontSize: 10, letterSpacing: 1.4, color: tokens.secondary },
  note: { marginTop: 8, lineHeight: 20, color: tokens.onSurface },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  link: { flex: 1, color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
});
