import { getOfflineReply } from './sarthiOffline';
import type { SarthiUserContext } from './sarthiTypes';

const enCtx: SarthiUserContext = {
  journeyPhase: 'ACTIVE',
  language: 'en',
  mode: 'auth',
  displayName: 'Priya',
  hasEmergencyContacts: true,
  regionalProtocols: true,
};

describe('sarthiOffline', () => {
  it('routes SOS keywords to emergency guidance in English', () => {
    const r = getOfflineReply('I need SOS help', enCtx);
    expect(r.reply).toMatch(/SOS/i);
    expect(r.reply).toContain('Priya');
    expect(r.actionCard?.title).toMatch(/Emergency/i);
  });

  it('routes corridor keywords with journey context', () => {
    const r = getOfflineReply('plan my corridor', {
      ...enCtx,
      journeyPhase: 'IDLE',
      corridorLabel: 'NH-44',
    });
    expect(r.reply).toMatch(/Trip|NH-44/i);
  });

  it('returns Hindi reply when language is hi', () => {
    const r = getOfflineReply('108 ambulance', {
      ...enCtx,
      language: 'hi',
    });
    expect(r.reply).toMatch(/108/);
    expect(r.reply).not.toBe(getOfflineReply('108', { ...enCtx, language: 'en' }).reply);
  });

  it('interpolates display name in crash playbook', () => {
    const r = getOfflineReply('we had a crash', enCtx);
    expect(r.reply).toContain('Priya');
    expect(r.kbMatch?.entry.id).toBe('crash_accident');
  });
});
