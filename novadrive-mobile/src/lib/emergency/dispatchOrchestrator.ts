import type { SupabaseClient } from '@supabase/supabase-js';
import type { DispatchResult } from './dispatchAdapters';
import { createDispatchAdapters } from './dispatchAdapters';
import type { IncidentType, Lang, MedicalProfile } from '../types';

export type DispatchOrchestratorInput = {
  incidentType: IncidentType;
  lat: number;
  lng: number;
  language: Lang;
  autoDispatchMedical: boolean;
  medical?: MedicalProfile;
  userId?: string;
};

export type DispatchEndpointConfig = {
  traumaUrl: string | undefined;
  policeUrl: string | undefined;
};

export function resolveDispatchEndpoints(config: DispatchEndpointConfig): {
  trauma: string;
  police: string;
  configured: boolean;
} {
  const trauma = config.traumaUrl?.trim() ?? '';
  const police = config.policeUrl?.trim() ?? '';
  const configured =
    Boolean(trauma && !trauma.includes('dispatch.novadrive.local')) &&
    Boolean(police && !police.includes('dispatch.novadrive.local'));
  return { trauma, police, configured };
}

export function buildDispatchBody(input: DispatchOrchestratorInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    incidentType: input.incidentType,
    lat: input.lat,
    lng: input.lng,
    language: input.language,
  };
  if (input.autoDispatchMedical && input.medical) {
    body.medical = {
      bloodType: input.medical.bloodType,
      allergies: input.medical.allergies,
      conditions: input.medical.conditions,
      medications: input.medical.medications,
    };
  }
  return body;
}

export async function persistDispatchEvent(
  client: SupabaseClient | null,
  userId: string | undefined,
  result: DispatchResult,
  payload: Record<string, unknown>
): Promise<void> {
  if (!client || !userId) return;
  await client.from('dispatch_events').insert({
    user_id: userId,
    reference_id: result.referenceId,
    payload_json: payload,
    status: result.status,
  });
}

export async function runHttpDispatch(
  input: DispatchOrchestratorInput,
  deps: {
    traumaEndpoint: string;
    policeEndpoint: string;
    fetchImpl?: typeof fetch;
    supabase?: SupabaseClient | null;
  }
): Promise<{ result: DispatchResult; error: string | null }> {
  const adapters = createDispatchAdapters({
    traumaEndpoint: deps.traumaEndpoint,
    policeEndpoint: deps.policeEndpoint,
    fetchImpl: deps.fetchImpl,
  });
  const payload = buildDispatchBody(input);
  try {
    const result = await adapters.requestDispatch({
      incidentType: input.incidentType,
      lat: input.lat,
      lng: input.lng,
      language: input.language,
    });
    await persistDispatchEvent(deps.supabase ?? null, input.userId, result, payload);
    return { result, error: null };
  } catch (e) {
    return {
      result: {
        traumaCenter: {
          name: 'Dispatch unavailable',
          phone: 'N/A',
          etaMinutes: null,
        },
        policeUnit: {
          name: 'Dispatch unavailable',
          phone: 'N/A',
          etaMinutes: null,
        },
        status: 'failed',
        referenceId: `DSP-fail-${Date.now().toString(36)}`,
      },
      error: (e as Error).message,
    };
  }
}
