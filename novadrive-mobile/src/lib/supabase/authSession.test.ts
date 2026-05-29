import {
  isValidEmail,
  isValidPassword,
  profileFromSession,
} from './authSession';

describe('authSession', () => {
  it('validates email', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('bad')).toBe(false);
  });

  it('requires password length', () => {
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('short')).toBe(false);
  });

  it('builds profile from session', () => {
    const profile = profileFromSession({
      user: {
        id: 'uid-1',
        email: 'driver@example.com',
        user_metadata: { display_name: 'Ravi' },
      },
    } as never);
    expect(profile.mode).toBe('auth');
    expect(profile.name).toBe('Ravi');
    expect(profile.supabaseUserId).toBe('uid-1');
  });
});
