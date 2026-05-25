import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { tokens as baseTokens } from './tokens';

/** Returns design tokens adjusted when high-contrast accessibility mode is on. */
export function useThemeTokens() {
  const { a11y } = useApp();
  return useMemo(() => {
    if (!a11y.highContrast) return baseTokens;
    return {
      ...baseTokens,
      background: '#ffffff',
      surface: '#ffffff',
      onSurface: '#000000',
      onSurfaceVariant: '#1a1a1a',
      outline: '#000000',
      outlineVariant: '#333333',
      primary: '#000000',
      onPrimary: '#ffffff',
      surfaceContainerLow: '#f0f0f0',
      surfaceContainer: '#e8e8e8',
      surfaceContainerHigh: '#dddddd',
    };
  }, [a11y.highContrast]);
}
