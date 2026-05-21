'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProgressRail } from '@/components/ProgressRail';
import { SeverityChip } from '@/components/SeverityChip';
import { FacilityCard } from '@/components/FacilityCard';
import { rankFacilities } from '@/lib/facilities';
import { loadSession, saveSession } from '@/lib/session-store';

export default function RoutePage() {
  const router = useRouter();
  const session = loadSession();
  const triage = session.triage ?? 'RED';
  const facilities = useMemo(() => rankFacilities(triage), [triage]);
  const [selectedId, setSelectedId] = useState(facilities[0]?.id);

  function continueFlow() {
    const f = facilities.find((x) => x.id === selectedId);
    if (!f) return;
    saveSession({ ...loadSession(), facility: f });
    router.push('/emergency/packet');
  }

  return (
    <AppShell backHref="/emergency/triage" title="Routing">
      <ProgressRail current="Route" />
      <SeverityChip triage={triage} />
      <h2 className="mt-4 mb-2 text-xl font-semibold font-[family-name:var(--font-display)]">
        Trauma-tier facilities
      </h2>
      <p className="mb-4 text-sm text-[var(--nova-muted)]">
        Not nearest pin — matched to <strong className="text-[var(--nova-text)]">{triage}</strong>{' '}
        severity.
      </p>
      <div className="flex flex-1 flex-col gap-3 overflow-auto pb-4">
        {facilities.map((f) => (
          <FacilityCard
            key={f.id}
            facility={f}
            selected={f.id === selectedId}
            onSelect={() => setSelectedId(f.id)}
          />
        ))}
      </div>
      <button type="button" onClick={continueFlow} className="nova-btn-primary">
        Build dispatch packet
      </button>
    </AppShell>
  );
}
