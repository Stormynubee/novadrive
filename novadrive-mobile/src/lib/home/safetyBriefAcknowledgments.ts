const STORAGE_KEY = 'novadrive_brief_ack';

export function parseBriefAcknowledgments(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
}

export function serializeBriefAcknowledgments(slugs: string[]): string {
  return JSON.stringify(slugs);
}

export { STORAGE_KEY as BRIEF_ACK_STORAGE_KEY };
