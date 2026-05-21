'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DispatchCard } from '@/components/DispatchCard';
import type { GoldenHourPacket } from '@/lib/types';
import { formatSms } from '@/lib/ghp';

const DEMO_PACKET: GoldenHourPacket = {
  id: 'demo-relay-001',
  createdAt: new Date().toISOString(),
  triage: 'RED',
  location: {
    lat: 13.0827,
    lng: 80.2707,
    nhCode: 'NH48',
    nhKm: 87,
    landmark: 'Near Sriperumbudur',
    capturedAt: new Date().toISOString(),
  },
  victims: {
    count: 1,
    canWalk: false,
    breathing: true,
    severeBleeding: true,
    capillaryRefillOk: false,
    followsCommands: false,
  },
  routing: {
    facilityName: 'Apollo Highway Trauma Center',
    facilityType: 'trauma',
    phone: '108',
    etaMinutes: 18,
    distanceKm: 12.4,
  },
  emergency: { dial: '108', state: 'Tamil Nadu', language: 'en' },
  integrity: 'nd-a3f2c891',
};

export default function ScanPage() {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [packet, setPacket] = useState<GoldenHourPacket | null>(null);

  function simulateScan() {
    setPacket(DEMO_PACKET);
    setVerified(true);
  }

  function sms108() {
    if (!packet) return;
    window.location.href = `sms:108?body=${encodeURIComponent(formatSms(packet))}`;
  }

  return (
    <AppShell backHref="/" title="Bystander">
      <div className="nova-card mb-6 flex aspect-[4/3] flex-col items-center justify-center border-dashed p-8">
        <QrCode className="h-16 w-16 text-[var(--nova-muted)]" aria-hidden />
        <p className="mt-4 text-center text-sm text-[var(--nova-muted)]">
          Camera scanner — tap below to simulate scan (demo)
        </p>
        <button type="button" onClick={simulateScan} className="nova-btn-secondary mt-6 max-w-xs">
          Simulate QR decode
        </button>
      </div>

      {verified === true && packet && (
        <div className="space-y-4" role="status">
          <div className="flex items-center gap-2 text-[var(--nova-cyan)]">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold">Packet verified · stored locally</span>
          </div>
          <DispatchCard packet={packet} />
          <button type="button" onClick={sms108} className="nova-btn-primary">
            Relay to 108 (SMS)
          </button>
        </div>
      )}

      {verified === false && (
        <div className="flex items-center gap-2 text-[var(--nova-red)]" role="alert">
          <AlertCircle className="h-5 w-5" aria-hidden />
          <span className="text-sm">Integrity check failed — do not relay</span>
        </div>
      )}

      <Link href="/" className="nova-btn-ghost mt-8 block text-center">
        Back to home
      </Link>
    </AppShell>
  );
}
