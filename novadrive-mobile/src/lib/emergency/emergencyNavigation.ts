import type { IncidentType } from '../types';

/** Manual incident picker — choose road accident vs natural calamity. */
export const EMERGENCY_SELECTION_PATH = '/emergency/selection';

/** Auto countdown after hold SOS or crash confirm. */
export const EMERGENCY_ACTIVATION_PATH = '/emergency/activation';

/** Main trauma response screen after activation loading. */
export const EMERGENCY_RESPONSE_PATH = '/emergency/response';

export const DEFAULT_QUICK_SOS_INCIDENT: IncidentType = 'road_accident';

export const EMERGENCY_HOLD_ENTRY_PATH = EMERGENCY_SELECTION_PATH;

export function shouldGateTriageWithoutIncident(incidentType?: IncidentType): boolean {
  return !incidentType;
}

export function shouldRedirectActivationToSelection(incidentType?: IncidentType): boolean {
  return !incidentType;
}
