'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { ProgressRail } from '@/components/ProgressRail';
import { RelayStrip } from '@/components/RelayStrip';
import { DispatchCard } from '@/components/DispatchCard';
import { formatSms, qrPayload } from '@/lib/ghp';
import { loadSession } from '@/lib/session-store';

export default function RelayPage() {
  const session = loadSession();
  const packet = session.packet;
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  function sms108() {
    if (!packet) return;
    const body = encodeURIComponent(formatSms(packet));
    window.location.href = `sms:108?body=${body}`;
  }

  return (
    <AppShell backHref="/emergency/packet" title="Relay">
      <ProgressRail current="Relay" />
      <RelayStrip active={online ? 3 : 2} />

      <h2 className="mt-6 mb-2 text-xl font-semibold font-[family-name:var(--font-display)]">
        {online ? 'Send when ready' : 'Human QR relay'}
      </h2>
      <p className="mb-6 text-sm text-[var(--nova-muted)]">
        {online
          ? 'Signal available — SMS 108 with pre-filled dispatch packet.'
          : 'Show QR to a bystander. They scan in NovaDrive and relay when they have signal.'}
      </p>

      {packet && (
        <>
          <div className="nova-card flex flex-col items-center p-6">
            <QRCodeSVG
              value={qrPayload(packet)}
              size={200}
              level="M"
              bgColor="#141b26"
              fgColor="#f59e0b"
              aria-label="Distress QR code"
            />
            <p className="mt-4 text-center text-xs text-[var(--nova-muted)]">
              Scan with NovaDrive → Scan distress QR
            </p>
          </div>
          <div className="mt-4">
            <DispatchCard packet={packet} />
          </div>
          {online ? (
            <button type="button" onClick={sms108} className="nova-btn-primary mt-6">
              SMS 108 with packet
            </button>
          ) : (
            <p className="mt-4 rounded-xl border border-[var(--nova-amber)]/30 bg-[var(--nova-amber)]/10 p-4 text-sm text-[var(--nova-amber)]">
              Stay on this screen. Ask someone with signal to scan the QR.
            </p>
          )}
        </>
      )}
      <Link href="/" className="nova-btn-ghost mt-6 text-center">
        Done — return home
      </Link>
    </AppShell>
  );
}
