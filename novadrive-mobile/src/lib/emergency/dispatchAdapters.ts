import type { IncidentType, Lang } from '../types';

type DispatchRequest = {
  incidentType: IncidentType;
  lat: number;
  lng: number;
  language: Lang;
};

type Responder = {
  name: string;
  phone: string;
  etaMinutes: number | null;
};

export type DispatchResult = {
  traumaCenter: Responder;
  policeUnit: Responder;
  status: 'dispatched' | 'partial' | 'failed';
  referenceId: string;
};

type DispatchStatus = {
  stage: 'queued' | 'accepted' | 'units_enroute' | 'arrived';
  lastUpdatedAt: string;
  unitsReady: number;
};

type CreateDispatchAdaptersInput = {
  traumaEndpoint: string;
  policeEndpoint: string;
  fetchImpl?: typeof fetch;
};

const UNAVAILABLE_RESPONDER: Responder = {
  name: 'Awaiting dispatch confirmation',
  phone: 'N/A',
  etaMinutes: null,
};

function toReferenceId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

async function readResponder(res: Response, key: 'center' | 'unit'): Promise<Responder> {
  if (!res.ok) throw new Error(`Dispatch endpoint failed: ${res.status}`);
  const payload = (await res.json()) as {
    center?: Partial<Responder>;
    unit?: Partial<Responder>;
  };
  const source = key === 'center' ? payload.center : payload.unit;
  if (!source?.name) throw new Error('Invalid dispatch payload.');
  return {
    name: source.name,
    phone: source.phone ?? 'N/A',
    etaMinutes:
      typeof source.etaMinutes === 'number' && source.etaMinutes > 0 ? source.etaMinutes : null,
  };
}

export function createDispatchAdapters({
  traumaEndpoint,
  policeEndpoint,
  fetchImpl = fetch,
}: CreateDispatchAdaptersInput) {
  return {
    async requestDispatch(input: DispatchRequest): Promise<DispatchResult> {
      const body = JSON.stringify(input);      const traumaPromise = fetchImpl(traumaEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).then((res) => readResponder(res, 'center'));
      const policePromise = fetchImpl(policeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).then((res) => readResponder(res, 'unit'));

      const [traumaResult, policeResult] = await Promise.allSettled([traumaPromise, policePromise]);
      const traumaCenter =
        traumaResult.status === 'fulfilled' ? traumaResult.value : UNAVAILABLE_RESPONDER;
      const policeUnit =
        policeResult.status === 'fulfilled' ? policeResult.value : UNAVAILABLE_RESPONDER;

      const status: DispatchResult['status'] =
        traumaResult.status === 'fulfilled' && policeResult.status === 'fulfilled'
          ? 'dispatched'
          : traumaResult.status === 'rejected' && policeResult.status === 'rejected'
            ? 'failed'
            : 'partial';
      return {
        traumaCenter,
        policeUnit,
        status,
        referenceId: toReferenceId('DSP'),
      };
    },

    async getDispatchStatus(referenceId: string): Promise<DispatchStatus> {
      void referenceId;
      return {
        stage: 'units_enroute',
        lastUpdatedAt: new Date().toISOString(),
        unitsReady: 2,
      };
    },
  };
}
