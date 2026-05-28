import { resolveSpeechLocale } from './voiceLocale';

describe('voiceLocale', () => {
  it('maps app language to preferred locale', () => {
    expect(resolveSpeechLocale('en')).toBe('en-IN');
    expect(resolveSpeechLocale('hi')).toBe('hi-IN');
    expect(resolveSpeechLocale('ta')).toBe('ta-IN');
  });

  it('falls back to english locale when unavailable', () => {
    const locale = resolveSpeechLocale('ta', ['en-IN', 'hi-IN']);
    expect(locale).toBe('en-IN');
  });
});
