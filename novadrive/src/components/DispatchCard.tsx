import type { GoldenHourPacket } from '@/lib/types';
import { formatSms } from '@/lib/ghp';

export function DispatchCard({ packet }: { packet: GoldenHourPacket }) {
  const sms = formatSms(packet);
  return (
    <article className="nova-card overflow-hidden" aria-label="Dispatch packet">
      <header className="border-b border-[var(--nova-border)] bg-[var(--nova-surface-2)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--nova-amber)]">
          Golden Hour Packet
        </p>
        <p className="text-xs text-[var(--nova-muted)]">ID {packet.id.slice(0, 8)}… · {packet.integrity}</p>
      </header>
      <pre className="dispatch-mono max-h-[280px] overflow-auto p-4 whitespace-pre-wrap">{sms}</pre>
    </article>
  );
}
