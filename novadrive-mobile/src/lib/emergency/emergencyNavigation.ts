import type { IncidentType } from '../types';

/** Single entry route after Quick SOS, Hold SOS, or "I need help". */
export const EMERGENCY_SELECTION_PATH = '/emergency/selection';

export function shouldGateTriageWithoutIncident(incidentType?: IncidentType): boolean {
  return !incidentType;
}
