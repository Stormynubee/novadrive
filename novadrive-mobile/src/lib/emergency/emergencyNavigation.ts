import type { IncidentType } from '../types';

/** Single entry route after Quick SOS, Hold SOS, or "I need help". */
export const EMERGENCY_ACTIVATION_PATH = '/emergency/activation';
/** Back-compat alias used by existing callers. */
export const EMERGENCY_SELECTION_PATH = EMERGENCY_ACTIVATION_PATH;

/** Main trauma response screen after activation loading. */
export const EMERGENCY_RESPONSE_PATH = '/emergency/response';

export function shouldGateTriageWithoutIncident(incidentType?: IncidentType): boolean {
  return !incidentType;
}
