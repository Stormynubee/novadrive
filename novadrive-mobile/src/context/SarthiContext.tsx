import { createContext, useContext, type ReactNode } from 'react';
import { useSarthiChat } from '../hooks/useSarthiChat';

type SarthiContextValue = ReturnType<typeof useSarthiChat>;

const SarthiContext = createContext<SarthiContextValue | null>(null);

export function SarthiProvider({ children }: { children: ReactNode }) {
  const value = useSarthiChat();
  return <SarthiContext.Provider value={value}>{children}</SarthiContext.Provider>;
}

export function useSarthi() {
  const ctx = useContext(SarthiContext);
  if (!ctx) throw new Error('useSarthi must be used within SarthiProvider');
  return ctx;
}
