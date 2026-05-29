import { type Href, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { getSupabaseClient, isSupabaseConfigured } from '../../src/lib/supabase/client';
import {
  listNearbyVerifiedVolunteers,
  type VolunteerProvider,
} from '../../src/lib/ngo/volunteerProviders';
import { toDialUrl, toSmsUrl } from '../../src/lib/emergency/contactActions';
import { tokens } from '../../src/theme/tokens';

export default function NgoIndexScreen() {
  const [volunteers, setVolunteers] = useState<VolunteerProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const client = getSupabaseClient();
      if (!client) {
        setVolunteers([]);
        return;
      }
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setVolunteers([]);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const rows = await listNearbyVerifiedVolunteers(client, {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setVolunteers(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.headRow}>
        <HudText variant="headlineMd" style={styles.title}>
          Verified volunteers
        </HudText>
        <MargiButton
          label="Register"
          variant="secondary"
          onPress={() => router.push('/ngo/register' as Href)}
        />
      </View>
      {!isSupabaseConfigured() ? (
        <HudText variant="bodySm" style={styles.sub}>
          Supabase is not configured — volunteer list requires online backend.
        </HudText>
      ) : loading ? (
        <HudText variant="bodySm" style={styles.sub}>
          Loading nearby providers…
        </HudText>
      ) : volunteers.length === 0 ? (
        <HudText variant="bodySm" style={styles.sub}>
          No verified volunteers within 25 km. Register your org and ask an admin to verify in Supabase Studio.
        </HudText>
      ) : (
        volunteers.map((v) => (
          <HudCard key={v.id} style={styles.card}>
            <HudText variant="bodyMd" style={styles.org}>
              {v.org_name}
            </HudText>
            <HudText variant="bodySm" style={styles.meta}>
              {v.contact_name} · {v.service_area}
            </HudText>
            <View style={styles.actions}>
              <Pressable
                onPress={() => {
                  const url = toDialUrl(v.phone);
                  if (url) void Linking.openURL(url);
                }}
                style={styles.chip}
              >
                <MaterialIcons name="call" size={16} color={tokens.primary} />
                <HudText variant="mono" style={styles.chipText}>
                  Call
                </HudText>
              </Pressable>
              <Pressable
                onPress={() => {
                  const url = toSmsUrl(v.phone);
                  if (url) void Linking.openURL(url);
                }}
                style={styles.chip}
              >
                <MaterialIcons name="sms" size={16} color={tokens.secondary} />
                <HudText variant="mono" style={styles.chipText}>
                  SMS
                </HudText>
              </Pressable>
            </View>
          </HudCard>
        ))
      )}
      <MargiButton label="Refresh list" variant="ghost" onPress={() => void refresh()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: tokens.primary, flex: 1 },
  sub: { color: tokens.onSurfaceVariant },
  card: { gap: 6 },
  org: { fontFamily: 'PublicSans_700Bold', color: tokens.primary },
  meta: { color: tokens.onSurfaceVariant },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radius.chip,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  chipText: { fontSize: 11, color: tokens.primary },
});
