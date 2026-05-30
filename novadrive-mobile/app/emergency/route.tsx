import { type Href, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { EmergencyStepShell } from '../../src/components/EmergencyStepShell';
import { FacilityCard } from '../../src/components/FacilityCard';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { useApp } from '../../src/context/AppContext';
import { rankFacilities } from '../../src/lib/facilitiesDb';
import { EMERGENCY_RESPONSE_PATH } from '../../src/lib/emergency/emergencyNavigation';
import { openMapsNavigate } from '../../src/lib/naariShakti/linkingActions';
import { DISPATCH_108 } from '../../src/lib/ghp';
import { resolveRegionalCoverage } from '../../src/lib/regionalCoverage';
import type { Facility } from '../../src/lib/types';
import { tokens } from '../../src/theme/tokens';

export default function RouteScreen() {
  const { session, selectFacility, triageResult } = useApp();
  const [list, setList] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(session.facility?.id ?? null);

  const coverage = useMemo(() => {
    if (!session.location) return null;
    return resolveRegionalCoverage(session.location.lat, session.location.lng);
  }, [session.location]);

  const baselineMode = coverage?.mode === 'baseline' || list.length === 0;

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

  useEffect(() => {
    if (!baselineMode || loading || triageResult === 'BLACK' || !DISPATCH_108) return;
    selectFacility(DISPATCH_108);
    setSelected(DISPATCH_108.id);
  }, [baselineMode, loading, selectFacility, triageResult]);

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

  const footer = baselineMode ? (
    <>
      <MargiButton label="Call 108" onPress={() => Linking.openURL('tel:108')} large />
      <MargiButton
        label="Build Golden Hour Packet"
        onPress={() => goPacket(DISPATCH_108 as Facility)}
        variant="secondary"
      />
    </>
  ) : (
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
      subtitle={
        baselineMode
          ? `${coverage?.stateName ?? 'India'} · Baseline coverage`
          : 'Nearest trauma-ready facilities within 100 km.'
      }
      showBack
      footer={footer}
    >
      {loading ? (
        <ActivityIndicator color={tokens.primary} />
      ) : baselineMode ? (
        <HudCard accent="secondary">
          <HudText variant="mono" style={{ color: tokens.secondary, marginBottom: 8 }}>
            {`${coverage?.stateName ?? 'India'} · BASELINE COVERAGE`}
          </HudText>
          <HudText variant="bodyMd" style={{ lineHeight: 22, color: tokens.primary }}>
            No verified hospitals in your area. Baseline mode — call 108 and share your GPS + triage.
          </HudText>
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
              onNavigate={
                f.lat != null && f.lng != null
                  ? () => openMapsNavigate(f.lat!, f.lng!)
                  : undefined
              }
            />
          ))}
        </>
      )}
    </EmergencyStepShell>
  );
}
