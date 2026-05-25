import {
  createThread,
  sendMessage,
  type SarthiEngineDeps,
} from './sarthiEngine';
import type { SarthiUserContext } from './sarthiTypes';

const baseCtx: SarthiUserContext = {
  journeyPhase: 'IDLE',
  language: 'en',
  mode: 'guest',
  hasEmergencyContacts: false,
  regionalProtocols: true,
  displayName: 'Alex',
};

function makeDeps(overrides: Partial<SarthiEngineDeps> = {}): SarthiEngineDeps {
  return {
    apiBaseUrl: 'http://test.local',
    isOnline: async () => true,
    fetchChat: async () => ({
      reply: 'Online assistant reply.',
      actionCard: { title: 'Secure Corridor Alpha', subtitle: 'NH-44 · 2.4km ahead' },
    }),
    getOfflineReply: (text, ctx) => ({
      reply: `Offline help for: ${text} (phase ${ctx.journeyPhase})`,
    }),
    now: () => 1_700_000_000_000,
    randomId: () => 'test-id',
    ...overrides,
  };
}

describe('sarthiEngine', () => {
  it('createThread uses personalized welcome', () => {
    const thread = createThread(makeDeps(), baseCtx);
    expect(thread.messages[0].text).toContain('Alex');
    expect(thread.messages[0].text).toContain('Sarthi');
  });

  it('sendMessage appends user and assistant messages', async () => {
    const deps = makeDeps();
    const thread = createThread(deps, baseCtx);
    const next = await sendMessage(thread, 'Hello Sarthi', baseCtx, deps);
    expect(next.messages).toHaveLength(3);
    const assistant = next.messages[next.messages.length - 1];
    expect(assistant.text).toContain('Online assistant');
  });

  it('uses offline reply when not online', async () => {
    const deps = makeDeps({ isOnline: async () => false });
    const thread = createThread(deps, { ...baseCtx, journeyPhase: 'ACTIVE' });
    const next = await sendMessage(thread, 'random xyz query', { ...baseCtx, journeyPhase: 'ACTIVE' }, deps);
    const assistant = next.messages[next.messages.length - 1];
    expect(assistant.text).toContain('Offline help');
  });

  it('falls back to offline when fetch fails', async () => {
    const deps = makeDeps({
      fetchChat: async () => {
        throw new Error('network');
      },
    });
    const thread = createThread(deps, baseCtx);
    const next = await sendMessage(thread, 'random xyz', baseCtx, deps);
    const assistant = next.messages[next.messages.length - 1];
    expect(assistant.text).toContain('Offline help');
  });

  it('skips fetch for high-confidence KB match when online', async () => {
    const fetchChat = jest.fn(async () => ({ reply: 'Online' }));
    const deps = makeDeps({ fetchChat });
    const thread = createThread(deps, baseCtx);
    await sendMessage(thread, 'vehicle on fire smoke', baseCtx, deps);
    expect(fetchChat).not.toHaveBeenCalled();
  });
});
