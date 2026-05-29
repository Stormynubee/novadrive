import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrivingHudBackdrop } from '../DrivingHudBackdrop';
import { HoldSOSButton } from '../HoldSOSButton';
import { DrivingHudHeader } from './DrivingHudHeader';
import { CompactSpeedometer } from './CompactSpeedometer';
import { SensorStatusRow } from './SensorStatusRow';

const SPEED_LIMIT_KMH = 80;

export function DrivingHudLayout({
  speedKmh,
  journeyActive,
  voiceMonitoring,
  onMenu,
  onEmergencyShare,
  onSOS,
  footer,
  hudWarningChip,
}: {
  speedKmh: number;
  journeyActive: boolean;
  voiceMonitoring: boolean;
  onMenu: () => void;
  onEmergencyShare: () => void;
  onSOS: () => void;
  footer?: ReactNode;
  hudWarningChip?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const speedDisplay = Math.round(speedKmh);
  const overSpeed = speedDisplay > SPEED_LIMIT_KMH;
  const arcRatio = Math.min(1, speedDisplay / 120);

  return (
    <View style={styles.root}>
      <DrivingHudBackdrop />
      <DrivingHudHeader
        paddingTop={insets.top + 8}
        onMenu={onMenu}
        onEmergencyShare={onEmergencyShare}
      />
      <View style={[styles.body, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.sosZone} accessibilityLabel="SOS hold zone">
          <HoldSOSButton onTrigger={onSOS} variant="hudTop" />
        </View>
        {hudWarningChip ? <View style={styles.chipRow}>{hudWarningChip}</View> : null}
        <SensorStatusRow voiceMonitoring={voiceMonitoring} motionLive={journeyActive} />
        <CompactSpeedometer
          speed={speedDisplay}
          speedLimitKmh={SPEED_LIMIT_KMH}
          arcRatio={arcRatio}
          overSpeed={overSpeed}
        />
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, justifyContent: 'flex-start', gap: 12, paddingTop: 4 },
  sosZone: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  chipRow: { paddingHorizontal: 16 },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
});
