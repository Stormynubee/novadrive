import type { IncidentType, Lang, TriageColor } from '../types';

export type TraumaSessionState =
  | 'syncing'
  | 'dispatching'
  | 'awaitingAnswer'
  | 'guidanceIssued'
  | 'escalated'
  | 'readyForRoute';

export type TraumaSession = {
  id: string;
  state: TraumaSessionState;
  incidentType: IncidentType;
  language: Lang;
  userName?: string;
  remainingSeconds: number;
  transcript: string[];
};

type StartInput = {
  incidentType: IncidentType;
  language: Lang;
  userName?: string;
};

type AdvanceInput = { seconds: number };

type FinalizedSession = {
  severity: TriageColor;
  recommendedFacilityType: 'trauma' | 'hospital' | 'clinic';
  handoffSummary: string;
};

type CreateEngineInput = {
  assessmentSeconds: number;
};

const SYNC_SECONDS = 8;
const DISPATCH_SECONDS = 18;

export function createTraumaSessionEngine({ assessmentSeconds }: CreateEngineInput) {
  const sessions = new Map<string, TraumaSession>();

  return {
    startSession(input: StartInput): TraumaSession {
      const session: TraumaSession = {
        id: `ts_${Date.now().toString(36)}`,
        state: 'syncing',
        incidentType: input.incidentType,
        language: input.language,
        userName: input.userName,
        remainingSeconds: assessmentSeconds,
        transcript: [],
      };
      sessions.set(session.id, session);
      return { ...session };
    },

    advance(sessionId: string, input: AdvanceInput): TraumaSession {
      const s = sessions.get(sessionId);
      if (!s) throw new Error('Session not found');
      s.remainingSeconds = Math.max(0, s.remainingSeconds - input.seconds);
      if (s.state === 'syncing' && assessmentSeconds - s.remainingSeconds >= SYNC_SECONDS) {
        s.state = 'dispatching';
      }
      if (
        s.state === 'dispatching' &&
        assessmentSeconds - s.remainingSeconds >= SYNC_SECONDS + DISPATCH_SECONDS
      ) {
        s.state = 'awaitingAnswer';
      }
      if (s.remainingSeconds === 0 && s.state !== 'readyForRoute') {
        s.state = 'escalated';
      }
      return { ...s };
    },

    recordAnswer(sessionId: string, text: string): TraumaSession {
      const s = sessions.get(sessionId);
      if (!s) throw new Error('Session not found');
      s.transcript.push(text.trim());
      s.state = 'guidanceIssued';
      return { ...s };
    },

    finalize(sessionId: string): FinalizedSession {
      const s = sessions.get(sessionId);
      if (!s) throw new Error('Session not found');
      const joined = s.transcript.join(' ').toLowerCase();
      const severe = /unconscious|not breathing|heavy bleeding|bleeding heavy|severe/.test(joined);
      const moderate = /fracture|dizzy|chest pain/.test(joined);
      const severity: TriageColor = severe ? 'RED' : moderate ? 'YELLOW' : 'GREEN';
      s.state = 'readyForRoute';
      return {
        severity,
        recommendedFacilityType: severity === 'GREEN' ? 'clinic' : 'trauma',
        handoffSummary: `Patient report: ${s.transcript.join(' | ') || 'no patient input yet'}`,
      };
    },
  };
}
