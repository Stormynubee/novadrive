export type SarthiBffStatus = 'online' | 'offline' | 'unconfigured';

const HEALTH_TIMEOUT_MS = 10_000;

export async function checkSarthiBffHealth(apiBase: string): Promise<SarthiBffStatus> {
  const base = apiBase.trim().replace(/\/$/, '');
  if (!base) return 'unconfigured';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const res = await fetch(`${base}/api/sarthi/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    if (!res.ok) return 'offline';
    const payload = (await res.json()) as { ok?: boolean; geminiReachable?: boolean };
    const reachable = payload.geminiReachable !== false;
    return payload.ok && reachable ? 'online' : 'offline';
  } catch {
    return 'offline';
  } finally {
    clearTimeout(timeout);
  }
}
