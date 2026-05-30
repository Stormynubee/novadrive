export type IncidentElapsedDisplay = {
  clock: string;
  caption: string;
  severity: 'normal' | 'urgent' | 'critical';
};

export function formatIncidentElapsedClock(elapsedMs: number): string {
  const totalSec = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function incidentElapsedSeverity(elapsedMs: number): IncidentElapsedDisplay['severity'] {
  const minutes = elapsedMs / 60_000;
  if (minutes >= 30) return 'critical';
  if (minutes >= 10) return 'urgent';
  return 'normal';
}

export function buildIncidentElapsedDisplay(
  activatedAtIso: string,
  nowMs = Date.now()
): IncidentElapsedDisplay {
  const started = Date.parse(activatedAtIso);
  const elapsedMs = Number.isFinite(started) ? Math.max(0, nowMs - started) : 0;
  const severity = incidentElapsedSeverity(elapsedMs);
  return {
    clock: formatIncidentElapsedClock(elapsedMs),
    caption: 'SINCE INCIDENT',
    severity,
  };
}
