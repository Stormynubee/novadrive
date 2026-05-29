'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { decompressFromEncodedURIComponent } from 'lz-string';

type QrDecoded = {
  id: string;
  triage: string;
  lat: number;
  lng: number;
  integrity: string;
};

function decodeRelayPayload(raw: string | null): QrDecoded | null {
  if (!raw) return null;
  try {
    const payload = raw.startsWith('ND1:') ? raw.slice(4) : raw;
    const json = raw.startsWith('ND1:')
      ? decompressFromEncodedURIComponent(payload)
      : raw;
    if (!json) return null;
    const parsed = JSON.parse(json) as QrDecoded;
    if (!parsed?.id || !parsed?.integrity) return null;
    return parsed;
  } catch {
    return null;
  }
}

function RelayContent() {
  const params = useSearchParams();
  const p = params.get('p');
  const decoded = useMemo(() => decodeRelayPayload(p), [p]);

  if (!decoded) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-xl font-bold text-slate-900">Margi — Bystander relay</h1>
        <p className="mt-4 text-slate-600">
          Invalid or missing packet. Scan the victim&apos;s Golden Hour QR or open the full link from
          their phone.
        </p>
      </main>
    );
  }

  const mapsUrl = `https://www.google.com/maps?q=${decoded.lat},${decoded.lng}`;
  const smsBody = encodeURIComponent(
    `MARGI GHP\nTriage: ${decoded.triage}\nLocation: ${decoded.lat.toFixed(5)}, ${decoded.lng.toFixed(5)}\nRelay ID: ${decoded.id}\nChecksum: ${decoded.integrity}`
  );
  const smsUrl = `sms:108?body=${smsBody}`;

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-xl font-bold text-slate-900">Margi — Golden Hour relay</h1>
      <p className="mt-2 text-sm text-slate-500">No app install required. Share with dispatch when you have signal.</p>

      <dl className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <dt className="text-xs font-semibold uppercase text-slate-500">Triage</dt>
          <dd className="text-lg font-bold text-orange-700">{decoded.triage}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-slate-500">Location</dt>
          <dd className="font-mono text-sm">{decoded.lat.toFixed(5)}, {decoded.lng.toFixed(5)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-slate-500">Packet ID</dt>
          <dd className="font-mono text-xs break-all">{decoded.id}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-slate-500">Checksum</dt>
          <dd className="font-mono text-xs">{decoded.integrity} (corruption check only)</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={mapsUrl}
          className="rounded-lg bg-blue-700 px-4 py-3 text-center font-semibold text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Maps
        </a>
        <a href={smsUrl} className="rounded-lg bg-orange-600 px-4 py-3 text-center font-semibold text-white">
          SMS 108 (opens composer)
        </a>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Margi provides decision support only. Verify location and triage with the victim or responders.
        Checksum detects accidental QR corruption — not cryptographic proof of origin.
      </p>
    </main>
  );
}

export default function RelayPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading relay…</main>}>
      <RelayContent />
    </Suspense>
  );
}
