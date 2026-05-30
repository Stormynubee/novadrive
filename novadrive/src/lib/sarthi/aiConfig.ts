import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { LanguageModel } from 'ai';

/** Fast Sarthi replies — prefer models with AI Studio free-tier availability */
export const SARTHI_MODEL_ID =
  process.env.SARTHI_GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

/** Strip BOM / whitespace accidentally added via CLI env upload */
export function sanitizeGoogleApiKey(raw: string | undefined): string {
  if (!raw) return '';
  return raw.replace(/^\uFEFF/, '').trim();
}

export function getGoogleApiKey(): string {
  return sanitizeGoogleApiKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

/** Scrub env at load so any library reading process.env directly gets a clean key */
if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  const clean = getGoogleApiKey();
  if (clean) process.env.GOOGLE_GENERATIVE_AI_API_KEY = clean;
}

export function isSarthiAiConfigured(): boolean {
  return Boolean(
    getGoogleApiKey() ||
      sanitizeGoogleApiKey(process.env.AI_GATEWAY_API_KEY) ||
      sanitizeGoogleApiKey(process.env.VERCEL_OIDC_TOKEN)
  );
}

function googleProvider() {
  const apiKey = getGoogleApiKey();
  if (!apiKey) return null;
  return createGoogleGenerativeAI({ apiKey });
}

/** Prefer direct Google when key is set; otherwise route via Vercel AI Gateway (ai v6 string model). */
export function resolveSarthiModel(): LanguageModel | string {
  const provider = googleProvider();
  if (provider) {
    return provider(SARTHI_MODEL_ID);
  }
  return `google/${SARTHI_MODEL_ID}`;
}

/** True when health should report Gemini reachable (not just “key present”). */
export async function probeSarthiGemini(): Promise<{ ok: boolean; error?: string }> {
  if (!isSarthiAiConfigured()) {
    return { ok: false, error: 'No AI key configured' };
  }
  try {
    const { text } = await generateText({
      model: resolveSarthiModel(),
      system: 'You are Sarthi health check. Reply in one short word.',
      prompt: 'ping',
      maxOutputTokens: 64,
    });
    if (!text?.trim()) {
      return { ok: false, error: 'Empty model response' };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gemini probe failed';
    return { ok: false, error: message };
  }
}
