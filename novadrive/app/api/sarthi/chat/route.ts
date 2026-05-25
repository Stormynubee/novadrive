import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/** Gemini Flash — fast Sarthi replies */
const SARTHI_MODEL = 'gemini-2.0-flash';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type SarthiUserContext = {
  journeyPhase?: 'IDLE' | 'ACTIVE';
  corridorLabel?: string;
  language?: 'en' | 'hi' | 'ta';
  displayName?: string;
  mode?: 'guest' | 'auth';
  medicalSummary?: string;
  hasEmergencyContacts?: boolean;
  regionalProtocols?: boolean;
};

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'Reply only in English.',
  hi: 'Reply only in Hindi (Devanagari script).',
  ta: 'Reply only in Tamil script.',
};

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get('origin')),
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured on the Sarthi BFF.' },
      { status: 503, headers }
    );
  }

  let body: { messages?: ChatMessage[]; context?: SarthiUserContext };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const messages = body.messages ?? [];
  const context = body.context ?? { journeyPhase: 'IDLE', language: 'en' };
  const lang = context.language ?? 'en';
  const name = context.displayName?.trim() || (lang === 'hi' ? 'अतिथि' : lang === 'ta' ? 'விருந்தினர்' : 'Guest driver');

  const system = [
    'You are Sarthi, the NovaDrive road-safety AI assistant for Indian highway drivers.',
    LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en,
    'Be concise: max 3 short sentences unless listing emergency steps.',
    'Never invent live telemetry or vitals.',
    `Address the user as ${name} when natural.`,
    `Journey phase: ${context.journeyPhase ?? 'IDLE'}.`,
    context.corridorLabel ? `Corridor: ${context.corridorLabel}.` : '',
    context.mode === 'guest'
      ? 'User is a guest — suggest adding Profile medical info for richer guidance.'
      : 'User is signed in.',
    context.medicalSummary
      ? `Medical on file (mention only if relevant to emergencies): ${context.medicalSummary}.`
      : 'No medical summary on file.',
    context.hasEmergencyContacts
      ? 'Emergency contacts are configured.'
      : 'No emergency contacts configured — suggest adding ICE in Profile.',
    context.regionalProtocols ? 'Regional India protocols enabled.' : '',
    'Suggest Plan Corridor (Trip tab), Hold SOS on active journey, or START triage in emergency flow when relevant.',
  ]
    .filter(Boolean)
    .join(' ');

  try {
    const { text } = await generateText({
      model: google(SARTHI_MODEL),
      system,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      maxOutputTokens: 256,
    });

    const reply = text.trim() || 'I am here to help with your NovaDrive corridor and safety plan.';
    const actionCard =
      /corridor|route|nh/i.test(reply) || /corridor|route/i.test(messages.at(-1)?.content ?? '')
        ? {
            title: 'Secure Corridor Alpha',
            subtitle: context.corridorLabel ?? 'NH-44 · Plan in Trip tab',
          }
        : undefined;

    return NextResponse.json({ reply, actionCard }, { headers });
  } catch (err) {
    console.error('[sarthi/chat]', err);
    return NextResponse.json({ error: 'Sarthi generation failed' }, { status: 500, headers });
  }
}
