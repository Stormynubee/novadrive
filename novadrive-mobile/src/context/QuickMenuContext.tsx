import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { MargiQuickMenuSheet } from '../components/MargiQuickMenuSheet';

type QuickMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
  isOpen: boolean;
};

const QuickMenuContext = createContext<QuickMenuContextValue | null>(null);

export function QuickMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openMenu, closeMenu, isOpen: open }),
    [open, openMenu, closeMenu]
  );

  return (
    <QuickMenuContext.Provider value={value}>
      {children}
      <MargiQuickMenuSheet visible={open} onClose={closeMenu} />
    </QuickMenuContext.Provider>
  );
}

export function useQuickMenu(): QuickMenuContextValue {
  const ctx = useContext(QuickMenuContext);
  if (!ctx) {
    throw new Error('useQuickMenu must be used within QuickMenuProvider');
  }
  return ctx;
}
