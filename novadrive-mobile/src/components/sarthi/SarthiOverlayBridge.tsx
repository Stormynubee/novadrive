import { useState } from 'react';
import { usePathname } from 'expo-router';
import { SarthiFab } from './SarthiFab';
import { SarthiMiniWindow } from './SarthiMiniWindow';

function shouldShowSarthi(pathname: string): boolean {
  if (!pathname) return false;
  if (/journey|emergency|scan/.test(pathname)) return false;
  return (
    pathname.startsWith('/(tabs)') ||
    /^\/(explore|drive|history|profile)(\/|$)/.test(pathname)
  );
}

export function SarthiOverlayBridge() {
  const pathname = usePathname();
  const visible = shouldShowSarthi(pathname);
  const [open, setOpen] = useState(false);

  return (
    <>
      <SarthiFab visible={visible && !open} onPress={() => setOpen(true)} />
      <SarthiMiniWindow open={visible && open} onClose={() => setOpen(false)} />
    </>
  );
}
