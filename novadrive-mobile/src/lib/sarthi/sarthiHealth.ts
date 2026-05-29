export type SarthiBffStatus = 'online' | 'offline' | 'unconfigured';

export async function checkSarthiBffHealth(apiBase: string): Promise<SarthiBffStatus> {
  const base = apiBase.trim().replace(/\/$/, '');
  if (!base) return 'unconfigured';
  try {
    const res = await fetch(`${base}/api/sarthi/health`, { method: 'GET' });
    if (!res.ok) return 'offline';
    const payload = (await res.json()) as { ok?: boolean };
    return payload.ok ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}
