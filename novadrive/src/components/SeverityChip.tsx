import type { TriageColor } from '@/lib/types';
import { TRIAGE_META } from '@/lib/startTriageFSM';

export function SeverityChip({ triage, large }: { triage: TriageColor; large?: boolean }) {
  const m = TRIAGE_META[triage];
  return (
    <div
      className={`inline-flex flex-col rounded-xl border px-4 py-2 ${m.className} ${large ? 'w-full items-center py-4' : ''}`}
      role="status"
      aria-label={`Triage ${triage}: ${m.label}`}
    >
      <span className={`font-bold tracking-wide ${large ? 'text-2xl' : 'text-sm'}`}>
        {triage} · {m.label}
      </span>
      <span className={`opacity-80 ${large ? 'text-sm' : 'text-xs'}`}>{m.sub}</span>
    </div>
  );
}
