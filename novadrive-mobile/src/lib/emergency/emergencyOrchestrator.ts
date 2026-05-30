import type { AppSettings, IncidentType, UserProfile } from '../types';
import type { EmergencySmsKind } from '../emergencySms';
import { rankFacilities } from '../facilitiesDb';
import { openEmergencySmsIntent, openIceSmsIntent, resolveEmergencyCoords } from '../emergencySms';
import { openMapsNavigate } from '../naariShakti/linkingActions';
import {
  planEmergencyOrchestrator,
  type EmergencyOrchestratorPlan,
} from './emergencyOrchestratorPlan';

export type { EmergencyOrchestratorPlan } from './emergencyOrchestratorPlan';
export { buildMargiIceSmsBody, planEmergencyOrchestrator } from './emergencyOrchestratorPlan';

export type EmergencyOrchestratorInput = {
  profile: UserProfile;
  settings: AppSettings;
  incidentType: IncidentType;
  smsKind: EmergencySmsKind;
  triage?: 'RED' | 'YELLOW' | 'GREEN';
};

export type EmergencyOrchestratorResult = EmergencyOrchestratorPlan & {
  iceSmsOpened: boolean;
  sms108Opened: boolean;
  mapsOpened: boolean;
};

export async function runEmergencyOrchestrator(
  input: EmergencyOrchestratorInput,
  deps?: {
    resolveCoords?: typeof resolveEmergencyCoords;
    rank?: typeof rankFacilities;
    openIce?: typeof openIceSmsIntent;
    open108?: typeof openEmergencySmsIntent;
    openMaps?: typeof openMapsNavigate;
  }
): Promise<EmergencyOrchestratorResult> {
  const resolveCoords = deps?.resolveCoords ?? resolveEmergencyCoords;
  const rank = deps?.rank ?? rankFacilities;
  const openIce = deps?.openIce ?? openIceSmsIntent;
  const open108 = deps?.open108 ?? openEmergencySmsIntent;
  const openMaps = deps?.openMaps ?? openMapsNavigate;

  const coords = await resolveCoords();
  const triage = input.triage ?? 'RED';
  const ranked = coords ? await rank(triage, coords.lat, coords.lng) : [];
  const nearest = ranked[0] ?? null;

  const plan = planEmergencyOrchestrator({
    profile: input.profile,
    settings: input.settings,
    coords,
    incidentType: input.incidentType,
    nearestFacility: nearest,
  });

  let iceSmsOpened = false;
  let sms108Opened = false;
  let mapsOpened = false;

  if (plan.openIceSms && plan.icePhone && plan.iceSmsBody) {
    iceSmsOpened = await openIce(plan.icePhone, plan.iceSmsBody);
  }
  if (plan.open108Sms) {
    sms108Opened = await open108(input.smsKind, coords);
  }
  if (plan.openMaps && plan.mapsTarget) {
    openMaps(plan.mapsTarget.lat, plan.mapsTarget.lng);
    mapsOpened = true;
  }

  return { ...plan, iceSmsOpened, sms108Opened, mapsOpened };
}
