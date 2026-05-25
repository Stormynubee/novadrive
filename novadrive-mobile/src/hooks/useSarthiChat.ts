import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const threadRef = useRef<SarthiThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [networkOffline, setNetworkOffline] = useState(false);
  const [bffUnavailable, setBffUnavailable] = useState(!apiBase.trim());
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
    threadRef.current = thread;
  }, [thread]);

  useEffect(() => {
    setBffUnavailable(!apiBase.trim());
  }, [apiBase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as SarthiThread;
          setThread(parsed);
          threadRef.current = parsed;
        } else if (!cancelled) {
          const fresh = createThread(deps, context);
          setThread(fresh);
          threadRef.current = fresh;
        }
      } catch {
        if (!cancelled) {
          const fresh = createThread(deps, context);
          setThread(fresh);
          threadRef.current = fresh;
        }
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
      const trimmed = text.trim();
      if (!trimmed) return;

      setLoading(true);
      try {
        const online = await deps.isOnline();
        setNetworkOffline(!online);
        setBffUnavailable(!apiBase.trim());

        const base = threadRef.current ?? createThread(deps, context);
        if (!threadRef.current) {
          setThread(base);
          threadRef.current = base;
        }

        const next = await sendMessage(base, trimmed, context, deps);
        threadRef.current = next;
        setThread(next);
      } catch {
        const base = threadRef.current ?? createThread(deps, context);
        const fallback = await sendMessage(base, trimmed, context, {
          ...deps,
          isOnline: async () => false,
        });
        threadRef.current = fallback;
        setThread(fallback);
        setNetworkOffline(true);
      } finally {
        setLoading(false);
      }
    },
    [context, deps, apiBase, hydrated]
  );

  const clearThread = useCallback(() => {
    const fresh = createThread(deps, context);
    threadRef.current = fresh;
    setThread(fresh);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, [deps, context]);

  const refreshWelcomeIfNeeded = useCallback(() => {
    setThread((t) => {
      const current = t ?? threadRef.current ?? createThread(deps, context);
      if (current.messages.length === 0) return createThread(deps, context);
      const [first, ...rest] = current.messages;
      if (first.role !== 'assistant') return current;
      const welcome = createThread(deps, context).messages[0];
      const updated = { ...current, messages: [welcome, ...rest] };
      threadRef.current = updated;
      return updated;
    });
  }, [deps, context]);

  const displayThread = thread ?? createThread(deps, context);

  return {
    thread: displayThread,
    loading,
    offlineMode: networkOffline,
    bffUnavailable,
    hydrated,
    send,
    clearThread,
    context,
    refreshWelcomeIfNeeded,
  };
}
