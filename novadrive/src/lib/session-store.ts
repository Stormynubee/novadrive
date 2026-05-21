'use client';

import type { EmergencySession } from './types';

const KEY = 'novadrive-session';

export function loadSession(): EmergencySession {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EmergencySession) : {};
  } catch {
    return {};
  }
}

export function saveSession(session: EmergencySession): void {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(KEY);
}
