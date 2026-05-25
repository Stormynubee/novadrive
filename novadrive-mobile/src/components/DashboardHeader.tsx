import { type Href, router } from 'expo-router';

import { NovaTopBar } from './NovaTopBar';

import { useApp } from '../context/AppContext';
import { useQuickMenu } from '../context/QuickMenuContext';

/**
 * Standard tab header — NOVA DRIVE chrome, menu + settings gear, saffron emergency share.
 */
export function DashboardHeader({
  title = 'NOVA DRIVE',
  subtitle = 'by Team Vortex',
  showBack,
  showSettings = true,
  /** Plan Corridor header: menu + emergency only (no gear). */
  planCorridorChrome = false,
  onMenuPress,
}: {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showSettings?: boolean;
  planCorridorChrome?: boolean;
  /** Override hamburger action; default opens quick-links drawer. */
  onMenuPress?: () => void;
}) {
  const { beginEmergencyFlow } = useApp();
  const { openMenu } = useQuickMenu();
  const openSettings = () => router.push('/settings' as Href);

  if (planCorridorChrome) {
    return (
      <NovaTopBar
        title={title}
        onMenu={openSettings}
        onEmergency={() => {
          beginEmergencyFlow();
          router.push('/emergency/locate' as Href);
        }}
      />
    );
  }

  const handleMenu = showSettings ? (onMenuPress ?? openMenu) : undefined;

  return (
    <NovaTopBar
      title={title}
      subtitle={subtitle}
      showBack={showBack}
      onMenu={handleMenu}
      onTrailingIcon={showSettings ? openSettings : undefined}
      trailingIcon={showSettings ? 'settings' : undefined}
      onEmergency={() => {
        beginEmergencyFlow();
        router.push('/emergency/locate' as Href);
      }}
    />
  );
}
