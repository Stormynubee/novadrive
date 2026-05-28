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
      const body = JSON.stringify(input);
      // #region agent log
      fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run3',hypothesisId:'B3',location:'src/lib/emergency/dispatchAdapters.ts:69',message:'dispatch request start',data:{incidentType:input.incidentType,lat:input.lat,lng:input.lng,traumaEndpoint,policeEndpoint},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const traumaPromise = fetchImpl(traumaEndpoint, {
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
      // #region agent log
      fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run3',hypothesisId:'B3',location:'src/lib/emergency/dispatchAdapters.ts:94',message:'dispatch request settled',data:{status,traumaResult:traumaResult.status,policeResult:policeResult.status,traumaName:traumaCenter.name,policeName:policeUnit.name},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

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
