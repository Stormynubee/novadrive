import type {
  SarthiChatResponse,
  SarthiMessage,
  SarthiThread,
  SarthiUserContext,
} from './sarthiTypes';
import { getOfflineReply, matchKnowledgeBase, shouldUseOfflineFirst } from './sarthiOffline';
import { getWelcomeMessage, wrapCloudUnavailableReply } from './sarthi/sarthiStrings';

export type SarthiEngineDeps = {
  apiBaseUrl?: string;
  isOnline: () => Promise<boolean>;
  fetchChat: (
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: SarthiUserContext
  ) => Promise<SarthiChatResponse>;
  getOfflineReply: (text: string, context: SarthiUserContext) => SarthiChatResponse;
  now: () => number;
  randomId: () => string;
};

let idCounter = 0;

export function defaultRandomId(): string {
  idCounter += 1;
  return `sarthi-${idCounter}-${Date.now()}`;
}

export function createThread(deps: SarthiEngineDeps, context: SarthiUserContext): SarthiThread {
  const welcome: SarthiMessage = {
    id: deps.randomId(),
    role: 'assistant',
    text: getWelcomeMessage(context),
    createdAt: deps.now(),
  };
  return {
    id: deps.randomId(),
    messages: [welcome],
    createdAt: deps.now(),
  };
}

export async function sendMessage(
  thread: SarthiThread,
  userText: string,
  context: SarthiUserContext,
  deps: SarthiEngineDeps
): Promise<SarthiThread> {
  const trimmed = userText.trim();
  if (!trimmed) return thread;

  const userMsg: SarthiMessage = {
    id: deps.randomId(),
    role: 'user',
    text: trimmed,
    createdAt: deps.now(),
  };

  let response: SarthiChatResponse;
  const history = [...thread.messages, userMsg]
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.text,
    }));

  const kbMatch = matchKnowledgeBase(trimmed);
  const offlineFirst = shouldUseOfflineFirst(kbMatch);

  const hasBff = Boolean(deps.apiBaseUrl?.trim());
  let cloudFailed = false;

  try {
    const online = await deps.isOnline();
    if (online && !offlineFirst && hasBff) {
      try {
        response = await deps.fetchChat(history, context);
      } catch {
        cloudFailed = true;
        response = deps.getOfflineReply(trimmed, context);
      }
    } else {
      response = deps.getOfflineReply(trimmed, context);
    }
  } catch {
    cloudFailed = true;
    response = deps.getOfflineReply(trimmed, context);
  }

  if (cloudFailed && !kbMatch) {
    response = {
      ...response,
      reply: wrapCloudUnavailableReply(response.reply, context),
    };
  }

  const assistantMsg: SarthiMessage = {
    id: deps.randomId(),
    role: 'assistant',
    text: response.reply,
    createdAt: deps.now(),
    actionCard: response.actionCard,
  };

  return {
    ...thread,
    messages: [...thread.messages, userMsg, assistantMsg],
  };
}

export function createProductionDeps(apiBaseUrl: string): SarthiEngineDeps {
  const base = apiBaseUrl.trim();
  return {
    apiBaseUrl: base,
    isOnline: async () => {
      try {
        const NetInfo = await import('@react-native-community/netinfo');
        const state = await NetInfo.default.fetch();
        const connected = Boolean(state.isConnected);
        const reachable = state.isInternetReachable;
        return connected && (reachable === null || reachable === true);
      } catch {
        return false;
      }
    },
    fetchChat: async (messages, context) => {
      if (!base) throw new Error('Sarthi BFF URL not configured');
      const url = `${base.replace(/\/$/, '')}/api/sarthi/chat`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25_000);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, context }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`Sarthi API ${res.status}${errBody ? `: ${errBody.slice(0, 120)}` : ''}`);
        }
        return (await res.json()) as SarthiChatResponse;
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfflineReply: (text, ctx) => {
      const r = getOfflineReply(text, ctx);
      return { reply: r.reply, actionCard: r.actionCard };
    },
    now: () => Date.now(),
    randomId: defaultRandomId,
  };
}
