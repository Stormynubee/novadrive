'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProgressRail } from '@/components/ProgressRail';
import { loadSession, saveSession } from '@/lib/session-store';
import type { LocationFix } from '@/lib/types';

export default function LocatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmark, setLandmark] = useState('');
  const [nhKm, setNhKm] = useState('');
  const [fix, setFix] = useState<LocationFix | null>(null);

  function captureLocation() {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not available in this browser.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const f: LocationFix = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          landmark: landmark || undefined,
          nhCode: 'NH48',
          nhKm: nhKm ? Number(nhKm) : undefined,
          capturedAt: new Date().toISOString(),
        };
        setFix(f);
        setLoading(false);
      },
      () => {
        setError('Could not get GPS. Enter landmark / NH km and continue.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  function continueFlow() {
    const session = loadSession();
    const location: LocationFix = fix ?? {
      lat: 13.0827,
      lng: 80.2707,
      landmark: landmark || 'NH48 corridor (manual)',
      nhCode: 'NH48',
      nhKm: nhKm ? Number(nhKm) : 87,
      capturedAt: new Date().toISOString(),
    };
    if (landmark) location.landmark = landmark;
    if (nhKm) location.nhKm = Number(nhKm);
    saveSession({ ...session, location });
    router.push('/emergency/triage');
  }

  return (
    <AppShell backHref="/" title="Emergency">
      <ProgressRail current="Locate" />
      <h2 className="mb-2 text-xl font-semibold font-[family-name:var(--font-display)]">
        Pin your corridor
      </h2>
      <p className="mb-6 text-sm text-[var(--nova-muted)]">
        One location read — we won&apos;t keep tracking you. Low accuracy saves battery.
      </p>

      <div className="nova-card mb-4 space-y-4 p-4">
        <button
          type="button"
          onClick={captureLocation}
          disabled={loading}
          className="nova-btn-secondary"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <MapPin className="h-5 w-5" aria-hidden />
          )}
          {loading ? 'Getting location…' : 'Use my location once'}
        </button>
        {fix && (
          <p className="text-xs text-[var(--nova-cyan)]" role="status">
            ✓ {fix.lat.toFixed(5)}, {fix.lng.toFixed(5)}
            {fix.accuracyMeters != null && ` (±${Math.round(fix.accuracyMeters)}m)`}
          </p>
        )}
        {error && (
          <p className="text-xs text-[var(--nova-amber)]" role="alert">
            {error}
          </p>
        )}
        <label className="block text-xs font-medium text-[var(--nova-muted)]">
          Landmark / NH km (helps 108)
          <input
            className="mt-1 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-bg)] px-3 py-3 text-[var(--nova-text)]"
            placeholder="e.g. NH48 km 87, near Sriperumbudur"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
        </label>
        <input
          className="w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-bg)] px-3 py-3 text-[var(--nova-text)]"
          placeholder="NH km marker (optional)"
          inputMode="numeric"
          value={nhKm}
          onChange={(e) => setNhKm(e.target.value)}
        />
      </div>

      <button type="button" onClick={continueFlow} className="nova-btn-primary mt-auto">
        Continue to triage
      </button>
    </AppShell>
  );
}
