import { NextResponse } from 'next/server';

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
  const hasKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  return NextResponse.json(
    {
      ok: hasKey,
      service: 'sarthi-bff',
      model: 'gemini-2.0-flash',
      geminiConfigured: hasKey,
    },
    { status: hasKey ? 200 : 503, headers: corsHeaders(origin) }
  );
}
