import { NextResponse } from 'next/server';
import {
  getGoogleApiKey,
  isSarthiAiConfigured,
  probeSarthiGemini,
  SARTHI_MODEL_ID,
} from '@/lib/sarthi/aiConfig';

export const runtime = 'nodejs';

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get('origin')),
  });
}

export async function GET(req: Request) {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);
  const configured = isSarthiAiConfigured();
  const googleKey = getGoogleApiKey();
  const provider = googleKey
    ? 'google-direct'
    : process.env.AI_GATEWAY_API_KEY?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim()
      ? 'ai-gateway'
      : 'none';

  const probe = configured ? await probeSarthiGemini() : { ok: false, error: 'not configured' };

  return NextResponse.json(
    {
      ok: configured && probe.ok,
      service: 'sarthi-bff',
      model: SARTHI_MODEL_ID,
      geminiConfigured: configured,
      geminiReachable: probe.ok,
      provider,
      ...(probe.error && !probe.ok ? { probeError: probe.error.slice(0, 200) } : {}),
    },
    { status: configured && probe.ok ? 200 : 503, headers }
  );
}
