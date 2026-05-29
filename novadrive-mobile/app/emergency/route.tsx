import { type Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { EmergencyStepShell } from '../../src/components/EmergencyStepShell';
import { FacilityCard } from '../../src/components/FacilityCard';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { useApp } from '../../src/context/AppContext';
import { rankFacilities } from '../../src/lib/facilitiesDb';
import { EMERGENCY_RESPONSE_PATH } from '../../src/lib/emergency/emergencyNavigation';
import type { Facility } from '../../src/lib/types';
import { tokens } from '../../src/theme/tokens';

export default function RouteScreen() {
  const { session, selectFacility, triageResult } = useApp();
  const [list, setList] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(session.facility?.id ?? null);

  useEffect(() => {
    if (!session.location || !triageResult) {
      setLoading(false);
      return;
    }
    setLoading(true);
    rankFacilities(triageResult, session.location.lat, session.location.lng)
      .then((f) => setList(f))
      .finally(() => setLoading(false));
  }, [session.location, triageResult]);

  if (!session.location) {
    return (
      <EmergencyStepShell
        step="Route"
        title="Route"
        subtitle="Capture your location first."
        showBack
        footer={<MargiButton label="Back to locate" onPress={() => router.replace('/emergency/locate')} large />}
      >
        {null}
      </EmergencyStepShell>
    );
  }

  if (!triageResult) {
    return (
      <EmergencyStepShell
        step="Route"
        title="Route"
        subtitle="Complete trauma response assessment first."
        showBack
        footer={
          <MargiButton
            label="Back to response"
            onPress={() => router.replace(EMERGENCY_RESPONSE_PATH as Href)}
            large
          />
        }
      >
        {null}
      </EmergencyStepShell>
    );
  }

  if (triageResult === 'BLACK') {
    return (
      <EmergencyStepShell
        step="Route"
        title="Route"
        subtitle="Notify 108 / police. No hospital routing for BLACK tag."
        showBack
        footer={
          <MargiButton label="Build packet for 108" onPress={() => router.push('/emergency/packet')} large />
        }
      >
        {null}
      </EmergencyStepShell>
    );
  }

  const goPacket = (f?: Facility) => {
    if (f) {
      selectFacility(f);
      setSelected(f.id);
    }
    router.push('/emergency/packet');
  };

  const footer = (
    <>
      <MargiButton
        label="Build Golden Hour Packet"
        onPress={() => goPacket(list.find((x) => x.id === selected))}
        large
        disabled={!selected && list.length > 0}
      />
      <MargiButton label="Call 108" onPress={() => Linking.openURL('tel:108')} variant="ghost" />
    </>
  );

  return (
    <EmergencyStepShell
      step="Route"
      title="Route"
      subtitle="Nearest trauma-ready facilities within 100 km."
      showBack
      footer={footer}
    >
      {loading ? (
        <ActivityIndicator color={tokens.primary} />
      ) : list.length === 0 ? (
        <HudCard accent="secondary">
          <HudText variant="bodyMd" style={{ lineHeight: 22, marginBottom: 12, color: tokens.primary }}>
            No facilities within 100 km in the offline pack. Call 108 — expand the regional POI
            seed for your state to extend the routing range.
          </HudText>
          <MargiButton
            label="Build packet anyway (108)"
            onPress={() =>
              goPacket({
                id: '108',
                name: 'National emergency (108)',
                type: 'hospital',
                traumaTier: 2,
                phone: '108',
                distanceKm: 0,
                etaMinutes: 0,
                verified: true,
              })
            }
            variant="secondary"
          />
        </HudCard>
      ) : (
        <>
          <HudText variant="mono" style={{ color: tokens.secondary }}>{`${list.length} FACILITIES NEAR YOU`}</HudText>
          {list.map((f) => (
            <FacilityCard
              key={f.id}
              facility={f}
              selected={selected === f.id}
              onPress={() => {
                selectFacility(f);
                setSelected(f.id);
              }}
            />
          ))}
        </>
      )}
    </EmergencyStepShell>
  );
}
