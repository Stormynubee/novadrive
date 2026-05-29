import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiTopBar } from '../../src/components/MargiTopBar';
import { listRahVeerClaims, markRahVeerPortalOpened, type RahVeerClaim } from '../../src/lib/rahveerDb';
import { MORTH_GOOD_SAMARITAN_URL } from '../../src/lib/rahveerLinks';
import { tokens } from '../../src/theme/tokens';

export default function RahVeerClaimScreen() {
  const [claims, setClaims] = useState<RahVeerClaim[]>([]);

  const refresh = useCallback(() => {
    listRahVeerClaims().then(setClaims);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openPortal = async (id: string) => {
    await markRahVeerPortalOpened(id);
    await Linking.openURL(MORTH_GOOD_SAMARITAN_URL);
    refresh();
  };

  return (
    <View style={styles.root}>
      <MargiTopBar title="Claim tickets" subtitle="Local Rah-Veer log" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        {claims.length === 0 ? (
          <HudCard accent="primary">
            <HudText variant="bodyMd" style={styles.empty}>
              No claims yet. After scanning a relay QR, open Rah-Veer to log your Good Samaritan
              handoff.
            </HudText>
          </HudCard>
        ) : (
          claims.map((c) => (
            <HudCard key={c.id} accent="secondary">
              <HudText variant="mono" style={styles.kicker}>
                RELAY {c.relayId.slice(0, 8).toUpperCase()}
              </HudText>
              <HudText variant="bodySm" style={styles.when}>
                {new Date(c.createdAt).toLocaleString()}
              </HudText>
              {c.lat != null && c.lng != null ? (
                <HudText variant="bodySm" style={styles.coords}>
                  {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                </HudText>
              ) : null}
              <Pressable style={styles.portalRow} onPress={() => openPortal(c.id)}>
                <MaterialIcons
                  name={c.portalOpened ? 'check-circle' : 'open-in-new'}
                  size={18}
                  color={c.portalOpened ? tokens.tertiary : tokens.primary}
                />
                <HudText variant="bodySm" style={styles.portalText}>
                  {c.portalOpened ? 'MoRTH portal opened' : 'Open MoRTH portal'}
                </HudText>
              </Pressable>
            </HudCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, gap: 12, paddingBottom: 48 },
  empty: { lineHeight: 22, color: tokens.onSurfaceVariant },
  kicker: { fontSize: 10, letterSpacing: 1.2, color: tokens.secondary },
  when: { color: tokens.onSurfaceVariant, marginTop: 4 },
  coords: { color: tokens.onSurface, marginTop: 4 },
  portalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  portalText: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
});
