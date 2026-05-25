jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import { formatIceLine, normalizeMedical, defaultMedical } from './storage';

describe('normalizeMedical', () => {
  it('migrates legacy emergencyContact string into primaryContact', () => {
    const m = normalizeMedical({
      ...defaultMedical(),
      emergencyContact: 'Priya Sharma +91 98765 43210',
      primaryContact: { fullName: '', relationship: '', phone: '' },
    });
    expect(m.primaryContact?.fullName).toContain('Priya');
    expect(m.primaryContact?.phone).toMatch(/98765/);
    expect(m.emergencyContact).toBe(formatIceLine(m.primaryContact));
  });

  it('keeps structured primary contact', () => {
    const m = normalizeMedical({
      ...defaultMedical(),
      primaryContact: { fullName: 'Alex', relationship: 'Spouse', phone: '+15551234' },
    });
    expect(m.emergencyContact).toBe('Alex · Spouse · +15551234');
  });
});

describe('formatIceLine', () => {
  it('joins name, relationship, and phone', () => {
    expect(
      formatIceLine({ fullName: 'Sam', relationship: 'Sibling', phone: '555' })
    ).toBe('Sam · Sibling · 555');
  });
});
