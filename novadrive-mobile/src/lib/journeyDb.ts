import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export type FeedbackPhase = 'pre_trip' | 'post_trip';
export type FeedbackCategory = 'road' | 'app' | 'safety' | 'other';

export interface JourneySummaryJson {
  stats: {
    durationSec: number;
    maxSpeedKmh: number;
    impactAlerts: number;
    voiceAlerts: number;
  };
  incidents: {
    impact: number;
    voice: number;
    sosTriggered?: boolean;
  };
  routeContext: string;
  feedbackNote?: string;
}

export interface JourneyLog {
  id: string;
  startedAt: string;
  endedAt: string | null;
  destination: string;
  maxSpeedKmh: number;
  impactAlerts: number;
  voiceAlerts: number;
  durationSec: number;
  summaryJson?: JourneySummaryJson | null;
}

export interface JourneyFeedback {
  id: string;
  journeyId: string | null;
  phase: FeedbackPhase;
  rating: number;
  category: FeedbackCategory;
  comment: string;
  createdAt: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('novadrive_journeys.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS journey_logs (
          id TEXT PRIMARY KEY NOT NULL,
          started_at TEXT NOT NULL,
          ended_at TEXT,
          destination TEXT NOT NULL,
          max_speed_kmh REAL DEFAULT 0,
          impact_alerts INTEGER DEFAULT 0,
          voice_alerts INTEGER DEFAULT 0,
          duration_sec INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS journey_feedback (
          id TEXT PRIMARY KEY NOT NULL,
          journey_id TEXT,
          phase TEXT NOT NULL,
          rating INTEGER NOT NULL,
          category TEXT NOT NULL,
          comment TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_feedback_journey ON journey_feedback(journey_id);
      `);
      try {
        await db.execAsync(`ALTER TABLE journey_logs ADD COLUMN summary_json TEXT`);
      } catch {
        /* column may already exist */
      }
      return db;
    })();
  }
  return dbPromise;
}

function parseSummary(raw: unknown): JourneySummaryJson | null {
  if (raw == null || raw === '') return null;
  try {
    return typeof raw === 'string' ? (JSON.parse(raw) as JourneySummaryJson) : (raw as JourneySummaryJson);
  } catch {
    return null;
  }
}

function rowToLog(row: Record<string, unknown>): JourneyLog {
  return {
    id: String(row.id),
    startedAt: String(row.started_at),
    endedAt: row.ended_at != null ? String(row.ended_at) : null,
    destination: String(row.destination),
    maxSpeedKmh: Number(row.max_speed_kmh) || 0,
    impactAlerts: Number(row.impact_alerts) || 0,
    voiceAlerts: Number(row.voice_alerts) || 0,
    durationSec: Number(row.duration_sec) || 0,
    summaryJson: parseSummary(row.summary_json),
  };
}

export async function createJourneyLog(destination: string): Promise<string> {
  const db = await getDb();
  const id = Crypto.randomUUID();
  const startedAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO journey_logs (id, started_at, destination) VALUES (?, ?, ?)`,
    id,
    startedAt,
    destination || 'Unnamed corridor'
  );
  return id;
}

export async function incrementJourneyAlerts(
  id: string,
  kind: 'impact' | 'voice'
): Promise<void> {
  const db = await getDb();
  const col = kind === 'impact' ? 'impact_alerts' : 'voice_alerts';
  await db.runAsync(`UPDATE journey_logs SET ${col} = ${col} + 1 WHERE id = ?`, id);
}

export async function finalizeJourneyLog(
  id: string,
  stats: { maxSpeedKmh: number; impactAlerts: number; voiceAlerts: number; durationSec: number }
): Promise<void> {
  const db = await getDb();
  const endedAt = new Date().toISOString();
  await db.runAsync(
    `UPDATE journey_logs SET ended_at = ?, max_speed_kmh = ?, impact_alerts = ?, voice_alerts = ?, duration_sec = ? WHERE id = ?`,
    endedAt,
    stats.maxSpeedKmh,
    stats.impactAlerts,
    stats.voiceAlerts,
    stats.durationSec,
    id
  );
}

export async function getJourneyLog(id: string): Promise<JourneyLog | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    `SELECT * FROM journey_logs WHERE id = ?`,
    id
  );
  return row ? rowToLog(row) : null;
}

export async function saveJourneySummary(id: string, summary: JourneySummaryJson): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE journey_logs SET summary_json = ? WHERE id = ?`, JSON.stringify(summary), id);
}

export async function getJourneySummary(id: string): Promise<JourneySummaryJson | null> {
  const log = await getJourneyLog(id);
  return log?.summaryJson ?? null;
}

export async function listRecentJourneys(limit = 20): Promise<JourneyLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM journey_logs WHERE ended_at IS NOT NULL ORDER BY ended_at DESC LIMIT ?`,
    limit
  );
  return rows.map(rowToLog);
}

export async function saveJourneyFeedback(input: {
  journeyId: string | null;
  phase: FeedbackPhase;
  rating: number;
  category: FeedbackCategory;
  comment: string;
}): Promise<string> {
  const db = await getDb();
  const id = Crypto.randomUUID();
  await db.runAsync(
    `INSERT INTO journey_feedback (id, journey_id, phase, rating, category, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.journeyId,
    input.phase,
    input.rating,
    input.category,
    input.comment.trim(),
    new Date().toISOString()
  );
  return id;
}

export async function listFeedbackForJourney(journeyId: string): Promise<JourneyFeedback[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM journey_feedback WHERE journey_id = ? ORDER BY created_at DESC`,
    journeyId
  );
  return rows.map((row) => ({
    id: String(row.id),
    journeyId: row.journey_id != null ? String(row.journey_id) : null,
    phase: row.phase as FeedbackPhase,
    rating: Number(row.rating),
    category: row.category as FeedbackCategory,
    comment: String(row.comment),
    createdAt: String(row.created_at),
  }));
}

export async function listCommunityFeedback(limit = 30): Promise<JourneyFeedback[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM journey_feedback ORDER BY created_at DESC LIMIT ?`,
    limit
  );
  return rows.map((row) => ({
    id: String(row.id),
    journeyId: row.journey_id != null ? String(row.journey_id) : null,
    phase: row.phase as FeedbackPhase,
    rating: Number(row.rating),
    category: row.category as FeedbackCategory,
    comment: String(row.comment),
    createdAt: String(row.created_at),
  }));
}
