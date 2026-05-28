import type { Lang } from '../types';

const PREFERRED_LOCALE: Record<Lang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
};

export function resolveSpeechLocale(language: Lang, availableLocales?: string[]): string {
  const preferred = PREFERRED_LOCALE[language];
  if (!availableLocales || availableLocales.length === 0) return preferred;
  if (availableLocales.includes(preferred)) return preferred;
  if (availableLocales.includes('en-IN')) return 'en-IN';
  return availableLocales[0];
}
