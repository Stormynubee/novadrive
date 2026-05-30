import { getAuthString } from './translations';

describe('authTranslations', () => {
  it('returns the correct translation for a given key and language', () => {
    expect(getAuthString('signIn', 'en')).toBe('Sign in');
    expect(getAuthString('signIn', 'hi')).toBe('साइन इन करें');
    expect(getAuthString('signIn', 'ta')).toBe('உள்நுழைக');
    expect(getAuthString('signIn', 'es')).toBe('Iniciar sesión');
    expect(getAuthString('signIn', 'fr')).toBe('Se connecter');
    expect(getAuthString('signIn', 'de')).toBe('Einloggen');
    expect(getAuthString('signIn', 'ja')).toBe('サインイン');
    expect(getAuthString('signIn', 'ar')).toBe('تسجيل الدخول');
  });

  it('returns display name correctly in all languages', () => {
    expect(getAuthString('displayName', 'en')).toBe('Display name');
    expect(getAuthString('displayName', 'hi')).toBe('प्रदर्शित नाम');
    expect(getAuthString('displayName', 'ta')).toBe('காட்சி பெயர்');
    expect(getAuthString('displayName', 'es')).toBe('Nombre a mostrar');
    expect(getAuthString('displayName', 'fr')).toBe("Nom d'affichage");
  });

  it('returns password correctly in all languages', () => {
    expect(getAuthString('password', 'en')).toBe('Password');
    expect(getAuthString('password', 'hi')).toBe('पासवर्ड');
    expect(getAuthString('password', 'ta')).toBe('கடவுச்சொல்');
    expect(getAuthString('password', 'es')).toBe('Contraseña');
    expect(getAuthString('password', 'fr')).toBe('Mot de passe');
  });

  it('returns fallback value if key does not exist', () => {
    expect(getAuthString('invalid_key' as any, 'en')).toBe('');
  });

  it('has exactly 4 words for guestOfflineDesc and profileSyncDesc in English', () => {
    const guestOffline = getAuthString('guestOfflineDesc' as any, 'en');
    const profileSync = getAuthString('profileSyncDesc', 'en');

    expect(guestOffline).toBe('Fuly offline on device');
    expect(profileSync).toBe('Secure sync to cloud.');

    expect(guestOffline.split(/\s+/).filter(Boolean).length).toBe(4);
    expect(profileSync.split(/\s+/).filter(Boolean).length).toBe(4);
  });
});
