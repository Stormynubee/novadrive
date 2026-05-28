import { usePathname } from 'expo-router';
import { useEffect } from 'react';

/** Notifies voice policy on route changes to suppress false distress alerts. */
export function useNavigationVoiceGrace(markNavigationTransition: () => void) {
  const pathname = usePathname();

  useEffect(() => {
    markNavigationTransition();
  }, [pathname, markNavigationTransition]);
}
