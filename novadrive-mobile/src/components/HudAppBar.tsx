import { router } from 'expo-router';
import { NovaTopBar } from './NovaTopBar';

/**
 * Legacy import surface. Routes through the new NovaTopBar so older screens (`ScreenShell`,
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
    <NovaTopBar
      title="NOVA DRIVE"
      showBack={showBack}
      onBack={onBack ?? (() => router.back())}
    />
  );
}
