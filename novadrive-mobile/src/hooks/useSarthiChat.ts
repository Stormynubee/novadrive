import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildSarthiUserContext } from '../lib/sarthi/buildSarthiContext';
import {
  createProductionDeps,
  createThread,
  sendMessage,
} from '../lib/sarthiEngine';
import type { SarthiThread, SarthiUserContext } from '../lib/sarthiTypes';

const STORAGE_KEY = '@novadrive/sarthi-thread';

export function useSarthiChat() {
  const { journeyStatus, profile } = useApp();
  const apiBase = process.env.EXPO_PUBLIC_SARTHI_API_URL ?? '';
  const deps = useMemo(() => createProductionDeps(apiBase), [apiBase]);

  const [thread, setThread] = useState<SarthiThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const context: SarthiUserContext = useMemo(
    () =>
      buildSarthiUserContext(
        profile,
        journeyStatus === 'ACTIVE' ? 'ACTIVE' : 'IDLE'
      ),
    [profile, journeyStatus]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          setThread(JSON.parse(raw) as SarthiThread);
        } else if (!cancelled) {
          setThread(createThread(deps, context));
        }
      } catch {
        if (!cancelled) setThread(createThread(deps, context));
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once on mount
  }, [deps]);

  useEffect(() => {
    if (!hydrated || !thread) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(thread)).catch(() => {});
  }, [thread, hydrated]);

  const send = useCallback(
    async (text: string) => {
      if (!thread || !text.trim()) return;
      setLoading(true);
      try {
        const online = await deps.isOnline();
        setOfflineMode(!online || !apiBase);
        const next = await sendMessage(thread, text, context, deps);
        setThread(next);
      } finally {
        setLoading(false);
      }
    },
    [thread, context, deps, apiBase]
  );

  const clearThread = useCallback(() => {
    const fresh = createThread(deps, context);
    setThread(fresh);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, [deps, context]);

  const refreshWelcomeIfNeeded = useCallback(() => {
    setThread((t) => {
      if (!t || t.messages.length === 0) return createThread(deps, context);
      const [first, ...rest] = t.messages;
      if (first.role !== 'assistant') return t;
      const welcome = createThread(deps, context).messages[0];
      return { ...t, messages: [welcome, ...rest] };
    });
  }, [deps, context]);

  return {
    thread: thread ?? createThread(deps, context),
    loading,
    offlineMode,
    hydrated,
    send,
    clearThread,
    context,
    refreshWelcomeIfNeeded,
  };
}
