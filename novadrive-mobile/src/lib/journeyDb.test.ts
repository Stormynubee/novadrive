jest.mock('expo-sqlite', () => {
  const journeyLogs: Record<string, unknown>[] = [];
  return {
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(),
      runAsync: jest.fn(async (sql: string, ...params: unknown[]) => {
        if (sql.includes('INSERT INTO journey_logs')) {
          journeyLogs.push({
            id: params[0],
            started_at: params[1],
            destination: params[2],
            ended_at: null,
            max_speed_kmh: 0,
            impact_alerts: 0,
            voice_alerts: 0,
            duration_sec: 0,
            summary_json: null,
          });
        }
        if (sql.includes('summary_json')) {
          const row = journeyLogs.find((r) => r.id === params[1]);
          if (row) row.summary_json = params[0];
        }
        if (sql.includes('UPDATE journey_logs SET ended_at')) {
          const row = journeyLogs.find((r) => r.id === params[5]);
          if (row) {
            row.ended_at = params[0];
            row.max_speed_kmh = params[1];
            row.impact_alerts = params[2];
            row.voice_alerts = params[3];
            row.duration_sec = params[4];
          }
        }
      }),
      getFirstAsync: jest.fn(async (_sql: string, id?: string) =>
        journeyLogs.find((r) => r.id === id) ?? null
      ),
      getAllAsync: jest.fn(async () => journeyLogs.filter((r) => r.ended_at != null)),
    })),
  };
});

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'journey-test-id'),
}));

import {
  createJourneyLog,
  finalizeJourneyLog,
  getJourneyLog,
  saveJourneySummary,
  type JourneySummaryJson,
} from './journeyDb';

describe('journeyDb summary', () => {
  it('saves and loads summary blob', async () => {
    const id = await createJourneyLog('OMR → Chennai');
    await finalizeJourneyLog(id, {
      maxSpeedKmh: 72,
      impactAlerts: 1,
      voiceAlerts: 0,
      durationSec: 600,
    });
    const summary: JourneySummaryJson = {
      stats: { durationSec: 600, maxSpeedKmh: 72, impactAlerts: 1, voiceAlerts: 0 },
      incidents: { impact: 1, voice: 0 },
      routeContext: 'Corridor Alpha-1',
    };
    await saveJourneySummary(id, summary);
    const log = await getJourneyLog(id);
    expect(log?.summaryJson?.routeContext).toBe('Corridor Alpha-1');
    expect(log?.summaryJson?.incidents.impact).toBe(1);
  });
});
