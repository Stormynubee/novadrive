import { type Href, router } from 'expo-router';

import { APP_DISPLAY_NAME } from '../lib/brand';
import { MargiTopBar } from './MargiTopBar';
import { useApp } from '../context/AppContext';
import { EMERGENCY_SELECTION_PATH } from '../lib/emergency/emergencyNavigation';
import { useQuickMenu } from '../context/QuickMenuContext';

/** Standard tab header — Margi chrome, menu + settings gear, orange emergency share. */
export function DashboardHeader({
  title = APP_DISPLAY_NAME,
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
      <MargiTopBar
        title={title}
        onMenu={openSettings}
        onEmergency={() => {
          beginEmergencyFlow();
          router.push(EMERGENCY_SELECTION_PATH as Href);
        }}
      />
    );
  }

  const handleMenu = showSettings ? (onMenuPress ?? openMenu) : undefined;

  return (
    <MargiTopBar
      title={title}
      subtitle={subtitle}
      showBack={showBack}
      onMenu={handleMenu}
      onTrailingIcon={showSettings ? openSettings : undefined}
      trailingIcon={showSettings ? 'settings' : undefined}
      onEmergency={() => {
        beginEmergencyFlow();
        router.push(EMERGENCY_SELECTION_PATH as Href);
      }}
    />
  );
}
