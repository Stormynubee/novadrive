import { type Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { CrashCandidateModal } from './CrashCandidateModal';
import { JourneyVoiceMonitor } from './JourneyVoiceMonitor';
import { useNavigationVoiceGrace } from '../hooks/useNavigationVoiceGrace';
import { useApp } from '../context/AppContext';
import { EMERGENCY_SELECTION_PATH } from '../lib/emergency/emergencyNavigation';
import { canDetectDistressVoice, shouldEnableVoiceMonitoring } from '../lib/journeyMonitoring';

/** Keeps impact sensors alive across tabs; voice when journey or Naari safety mode allows. */
export function SafetyMonitorBridge() {
  const {
    journeyStatus,
    profile,
    settings,
    ensureSafetyMonitoring,
    crashDialogOpen,
    safetyAlertReason,
    calmCountdown,
    dismissCrashDialog,
    beginEmergencyFlow,
    markNavigationTransition,
  } = useApp();

  const journeyActive = journeyStatus === 'ACTIVE';
  const [appForeground, setAppForeground] = useState(AppState.currentState === 'active');
  const voiceEnabled = shouldEnableVoiceMonitoring(settings);
  const womenHelpModeActive =
    profile.gender === 'female' && Boolean(profile.naariShakti?.safetyModeActive);

  const voiceMonitorMounted = canDetectDistressVoice({
    journeyActive,
    appForeground,
    isFemaleSafetyHelpActive: womenHelpModeActive,
  });

  const voiceMonitorActive = voiceEnabled && voiceMonitorMounted;

  useNavigationVoiceGrace(markNavigationTransition);

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
    router.push(EMERGENCY_SELECTION_PATH as Href);
  };

  return (
    <>
      {voiceMonitorMounted ? <JourneyVoiceMonitor active={voiceMonitorActive} /> : null}
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
