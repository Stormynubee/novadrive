'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Share2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProgressRail } from '@/components/ProgressRail';
import { SeverityChip } from '@/components/SeverityChip';
import { DispatchCard } from '@/components/DispatchCard';
import { buildPacket } from '@/lib/ghp';
import { loadSession, saveSession } from '@/lib/session-store';
import type { GoldenHourPacket } from '@/lib/types';
import type { TriageColor } from '@/lib/types';

export default function PacketPage() {
  const router = useRouter();
  const [triage, setTriage] = useState<TriageColor | undefined>();
  const [packet, setPacket] = useState<GoldenHourPacket | null>(null);

  useEffect(() => {
    const session = loadSession();
    setTriage(session.triage);
    const p = buildPacket(session);
    if (p) {
      saveSession({ ...session, packet: p });
      setPacket(p);
    }
  }, []);

  async function copyPacket() {
    if (!packet) return;
    const text = document.querySelector('.dispatch-mono')?.textContent ?? '';
    await navigator.clipboard.writeText(text);
  }

  return (
    <AppShell backHref="/emergency/route" title="Packet">
      <ProgressRail current="Packet" />
      {triage && <SeverityChip triage={triage} />}
      <h2 className="mt-4 mb-4 text-xl font-semibold font-[family-name:var(--font-display)]">
        Dispatch packet ready
      </h2>
      {packet ? (
        <>
          <DispatchCard packet={packet} />
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={copyPacket} className="nova-btn-secondary flex-1">
              <Copy className="h-4 w-4" aria-hidden />
              Copy
            </button>
            <button
              type="button"
              className="nova-btn-secondary flex-1"
              onClick={() => navigator.share?.({ title: 'Margi GHP', text: 'Emergency packet' })}
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--nova-amber)]">Complete location and facility first.</p>
      )}
      <button
        type="button"
        onClick={() => router.push('/emergency/relay')}
        className="nova-btn-primary mt-6"
      >
        Show QR relay
      </button>
      <Link href="/" className="nova-btn-ghost mt-3 text-center">
        Back to home
      </Link>
    </AppShell>
  );
}
