jest.mock('expo-sqlite', () => {
  const tables = new Map<string, Record<string, unknown>[]>();
  const ensure = (name: string) => {
    if (!tables.has(name)) tables.set(name, []);
  };
  return {
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(async (sql: string) => {
        if (sql.includes('rahveer_claims')) ensure('rahveer_claims');
      }),
      runAsync: jest.fn(async (sql: string, ...params: unknown[]) => {
        ensure('rahveer_claims');
        const rows = tables.get('rahveer_claims')!;
        if (sql.startsWith('INSERT')) {
          rows.push({
            id: params[0],
            relay_id: params[1],
            created_at: params[2],
            lat: params[3],
            lng: params[4],
            portal_opened: 0,
            note: params[5],
          });
        }
        if (sql.includes('portal_opened = 1')) {
          const row = rows.find((r) => r.id === params[0]);
          if (row) row.portal_opened = 1;
        }
      }),
      getAllAsync: jest.fn(async () => tables.get('rahveer_claims') ?? []),
    })),
  };
});

jest.mock('expo-crypto', () => ({
  randomUUID: jest
    .fn()
    .mockReturnValueOnce('claim-1')
    .mockReturnValueOnce('claim-2'),
}));

import { insertRahVeerClaim, listRahVeerClaims, markRahVeerPortalOpened } from './rahveerDb';

describe('rahveerClaims', () => {
  it('inserts and lists claim records', async () => {
    const id = await insertRahVeerClaim({ relayId: 'relay-abc', lat: 13.1, lng: 80.2 });
    expect(id).toBe('claim-1');
    const list = await listRahVeerClaims();
    expect(list[0].relayId).toBe('relay-abc');
    await markRahVeerPortalOpened(id);
    const updated = await listRahVeerClaims();
    expect(updated[0].portalOpened).toBe(true);
  });
});
