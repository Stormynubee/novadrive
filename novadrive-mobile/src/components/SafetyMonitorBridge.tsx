import { type Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { CrashCandidateModal } from './CrashCandidateModal';
import { JourneyVoiceMonitor } from './JourneyVoiceMonitor';
import { useApp } from '../context/AppContext';
import { shouldEnableVoiceMonitoring } from '../lib/journeyMonitoring';

/** Keeps impact sensors alive across tabs; voice only during foreground active journey. */
export function SafetyMonitorBridge() {
  const {
    journeyStatus,
    settings,
    ensureSafetyMonitoring,
    crashDialogOpen,
    safetyAlertReason,
    calmCountdown,
    dismissCrashDialog,
    beginEmergencyFlow,
  } = useApp();

  const journeyActive = journeyStatus === 'ACTIVE';
  const [appForeground, setAppForeground] = useState(AppState.currentState === 'active');
  const voiceEnabled = shouldEnableVoiceMonitoring(settings);
  const voiceMonitorActive = journeyActive && appForeground && voiceEnabled;

  useFocusEffect(
    useCallback(() => {
      if (journeyActive) {
        void ensureSafetyMonitoring();
      }
    }, [journeyActive, ensureSafetyMonitoring])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      setAppForeground(next === 'active');
      if (next === 'active' && journeyActive) {
        void ensureSafetyMonitoring();
      }
    });
    return () => sub.remove();
  }, [journeyActive, ensureSafetyMonitoring]);

  useEffect(() => {
    if (!journeyActive) return;
    void ensureSafetyMonitoring();
    const heartbeat = setInterval(() => void ensureSafetyMonitoring(), 12_000);
    return () => clearInterval(heartbeat);
  }, [journeyActive, ensureSafetyMonitoring]);

  const onConfirmAlert = () => {
    dismissCrashDialog();
    beginEmergencyFlow();
    router.push('/emergency/locate' as Href);
  };

  return (
    <>
      {journeyActive ? <JourneyVoiceMonitor active={voiceMonitorActive} /> : null}
      <CrashCandidateModal
        visible={crashDialogOpen}
        countdown={calmCountdown}
        reason={safetyAlertReason}
        onDismiss={dismissCrashDialog}
        onConfirm={onConfirmAlert}
      />
    </>
  );
}
