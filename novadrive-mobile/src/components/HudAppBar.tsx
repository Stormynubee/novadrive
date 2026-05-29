import { router } from 'expo-router';
import { MargiTopBar } from './MargiTopBar';

/**
 * Legacy import surface. Routes through the new MargiTopBar so older screens (`ScreenShell`,
 * `EmergencyStepShell`) keep their imports without a sweep.
 */
export function HudAppBar({
  showBack,
  onBack,
  showBrand,
  live,
}: {
  showBack?: boolean;
  onBack?: () => void;
  showBrand?: boolean;
  live?: boolean;
}) {
  void showBrand;
  void live;
  return (
    <MargiTopBar
      title="Margi"
      showBack={showBack}
      onBack={onBack ?? (() => router.back())}
    />
  );
}
