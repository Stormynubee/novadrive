import { useState } from 'react';
import { usePathname } from 'expo-router';
import { SarthiFab } from './SarthiFab';
import { SarthiHomeWidget } from './SarthiHomeWidget';
import { SarthiMiniWindow } from './SarthiMiniWindow';

function shouldShowSarthi(pathname: string): boolean {
  if (!pathname) return false;
  if (/journey|emergency|scan|naari-shakti/.test(pathname)) return false;
  return (
    pathname.startsWith('/(tabs)') ||
    /^\/(explore|drive|history|profile)(\/|$)/.test(pathname)
  );
}

export function SarthiOverlayBridge() {
  const pathname = usePathname();
  const visible = shouldShowSarthi(pathname);
  const isHome = Boolean(pathname?.includes('explore'));
  const [open, setOpen] = useState(false);

  if (isHome && visible) {
    return <SarthiHomeWidget />;
  }

  return (
    <>
      <SarthiFab visible={visible && !open} onPress={() => setOpen(true)} />
      <SarthiMiniWindow open={visible && open} onClose={() => setOpen(false)} />
    </>
  );
}
