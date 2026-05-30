import { type Href, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as Location from 'expo-location';
import { HudText } from '../../src/components/HudText';
import { MargiLogoMark } from '../../src/components/MargiLogo';
import { MedicalDisclaimerBanner } from '../../src/components/MedicalDisclaimerBanner';
import { LanguageSelector } from '../../src/components/emergency/LanguageSelector';
import { useApp } from '../../src/context/AppContext';
import {
  ACTIVATION_SPLASH_SECONDS,
  shouldNavigateToResponse,
  type ActivationMode,
} from '../../src/lib/emergency/activationAuto';
import {
  activationCountdownProgress,
  autoAdvanceLabel,
  shouldShowManualContinue,
} from '../../src/lib/emergency/activationUi';
import {
  EMERGENCY_HOLD_ENTRY_PATH,
  EMERGENCY_RESPONSE_PATH,
  EMERGENCY_SELECTION_PATH,
  shouldRedirectActivationToSelection,
} from '../../src/lib/emergency/emergencyNavigation';
import { runEmergencyOrchestrator } from '../../src/lib/emergency/emergencyOrchestrator';

const EMERGENCY_TRIAGE_PATH = '/emergency/triage';
import { tokens } from '../../src/theme/tokens';

const ROTATING_STATUS = [
  'SYNCHRONIZING WITH NEAREST TRAUMA CENTER...',
  'ALERTING LOCAL POLICE UNIT...',
  'ESTABLISHING SECURE PIPELINE...',
  'TRANSMITTING CRITICAL BIOMETRICS...',
  'NOTIFYING EMERGENCY CONTACTS...',
];

const RING_SIZE = 200;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function EmergencyActivationScreen() {
  const { settings, updateSettings, session, resetEmergency, profile, setLocation, selectFacility, markIncidentActivated } =
    useApp();
  const [statusIndex, setStatusIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ACTIVATION_SPLASH_SECONDS);
  const [mode, setMode] = useState<ActivationMode>('auto');
  const [backendReady, setBackendReady] = useState(false);
  const hasAutoNavigatedRef = useRef(false);
  const orchestratorRanRef = useRef(false);
  const status = useMemo(() => ROTATING_STATUS[statusIndex % ROTATING_STATUS.length], [statusIndex]);
  const progress = activationCountdownProgress(secondsLeft, ACTIVATION_SPLASH_SECONDS);
  const showContinue = shouldShowManualContinue(mode, secondsLeft);

  useEffect(() => {
    if (!shouldRedirectActivationToSelection(session.incidentType)) return;
    router.replace(EMERGENCY_SELECTION_PATH as Href);
  }, [session.incidentType]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await Location.getForegroundPermissionsAsync();
        if (active) setBackendReady(true);
      } catch {
        /* timeout fallback handles this path */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) return 0;
        return value - 1;
      });
    }, 1000);
    return () => {
      clearInterval(countdownTimer);
    };
  }, []);

  useEffect(() => {
    if (backendReady) return;
    const statusTimer = setInterval(() => setStatusIndex((n) => n + 1), 2000);
    return () => clearInterval(statusTimer);
  }, [backendReady]);

  const runOrchestration = async () => {
    if (orchestratorRanRef.current || !session.incidentType) return;
    orchestratorRanRef.current = true;
    const result = await runEmergencyOrchestrator({
      profile,
      settings,
      incidentType: session.incidentType,
      smsKind: 'sos_hold',
      triage: session.triage ?? 'RED',
    });
    if (result.coords) {
      setLocation({
        lat: result.coords.lat,
        lng: result.coords.lng,
        capturedAt: new Date().toISOString(),
      });
    }
    if (result.nearestFacility) {
      selectFacility(result.nearestFacility);
    }
  };

  const navigateToResponse = async (selectedMode: ActivationMode) => {
    await runOrchestration();
    markIncidentActivated();
    const responseMode = selectedMode === 'manual' ? 'guided' : 'auto';
    router.replace(`${EMERGENCY_RESPONSE_PATH}?mode=${responseMode}` as Href);
  };

  useEffect(() => {
    if (
      !shouldNavigateToResponse({
        mode,
        secondsLeft,
        backendReady,
        alreadyNavigated: hasAutoNavigatedRef.current,
      })
    ) {
      return;
    }
    hasAutoNavigatedRef.current = true;
    void navigateToResponse(mode);
  }, [secondsLeft, mode, backendReady]);

  const cancelFlow = () => {
    resetEmergency();
    router.replace('/(tabs)/explore' as Href);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace(EMERGENCY_SELECTION_PATH as Href)}>
          <MaterialIcons name="arrow-back" size={24} color={tokens.onPrimary} />
        </Pressable>
        <HudText variant="headlineMd" style={styles.headerTitle}>
          ACTIVATING SOS
        </HudText>
        <Pressable onPress={() => router.replace(EMERGENCY_SELECTION_PATH as Href)}>
          <MaterialIcons name="emergency-share" size={22} color={tokens.onPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.logoWrap}>
          <View style={styles.ringHost}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={tokens.outlineVariant}
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={tokens.secondary}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeDasharray={`${RING_CIRCUMFERENCE}`}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                strokeLinecap="round"
                rotation={-90}
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.logoInner}>
              <MargiLogoMark size={72} />
            </View>
          </View>
          {mode === 'auto' ? (
            <HudText variant="mono" style={styles.autoLabel}>
              {autoAdvanceLabel(secondsLeft)}
            </HudText>
          ) : null}
        </View>

        <MedicalDisclaimerBanner compact />

        <View style={styles.statusWrap}>
          <HudText variant="headlineMd" style={styles.statusText}>
            {status}
          </HudText>
          <HudText variant="mono" style={styles.protocolText}>
            {`ACTIVE PROTOCOL · ${session.incidentType?.replace('_', ' ').toUpperCase() ?? 'EMERGENCY'}`}
          </HudText>
        </View>

        <LanguageSelector
          value={settings.language}
          onChange={(value) => {
            void updateSettings({ language: value });
          }}
        />

        {mode === 'auto' ? (
          <Pressable onPress={() => setMode('manual')} style={styles.manualLink}>
            <HudText variant="bodySm" style={styles.manualLinkText}>
              Switch to manual
            </HudText>
          </Pressable>
        ) : (
          <Pressable onPress={() => setMode('auto')} style={styles.manualLink}>
            <HudText variant="bodySm" style={styles.manualLinkText}>
              Switch to auto
            </HudText>
          </Pressable>
        )}

        {showContinue ? (
          <Pressable
            style={({ pressed }) => [styles.continueButton, pressed && styles.continueButtonPressed]}
            onPress={() => {
              hasAutoNavigatedRef.current = true;
              if (mode === 'manual') {
                router.push(EMERGENCY_TRIAGE_PATH as Href);
                return;
              }
              void navigateToResponse(mode);
            }}
          >
            <HudText variant="bodyMd" style={styles.continueText}>
              {mode === 'auto' && secondsLeft > 0 ? `Continue in ${secondsLeft}s` : 'Continue'}
            </HudText>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <HudText variant="mono" style={styles.footerTitle}>
          SARTHI AI ACTIVE
        </HudText>
        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
          onPress={cancelFlow}
        >
          <MaterialIcons name="close" size={18} color={tokens.error} />
          <HudText variant="bodyMd" style={styles.cancelText}>
            CANCEL SOS
          </HudText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.surface },
  header: {
    height: 64,
    backgroundColor: tokens.primary,
    paddingHorizontal: tokens.spacing.sideMargin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  headerTitle: { color: tokens.onPrimary, fontFamily: 'HankenGrotesk_700Bold' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingTop: tokens.spacing.stackMd,
    paddingBottom: tokens.spacing.stackLg,
    gap: tokens.spacing.stackMd,
  },
  logoWrap: { alignItems: 'center', gap: 12 },
  ringHost: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvg: { position: 'absolute' },
  logoInner: { alignItems: 'center', justifyContent: 'center' },
  autoLabel: {
    color: tokens.secondary,
    letterSpacing: 1.2,
    fontFamily: 'PublicSans_700Bold',
    textAlign: 'center',
  },
  statusWrap: { gap: 8, alignItems: 'center' },
  statusText: { textAlign: 'center', color: tokens.primary, fontFamily: 'HankenGrotesk_700Bold' },
  protocolText: {
    color: tokens.onSurfaceVariant,
    letterSpacing: 1.1,
    textAlign: 'center',
    fontFamily: 'PublicSans_700Bold',
  },
  manualLink: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  manualLinkText: { color: tokens.primary, fontFamily: 'PublicSans_700Bold', textDecorationLine: 'underline' },
  continueButton: {
    minHeight: 54,
    borderRadius: tokens.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.primary,
  },
  continueButtonPressed: { backgroundColor: tokens.primaryDeep },
  continueText: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  footer: {
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
  },
  footerTitle: { color: tokens.primary, textAlign: 'center', fontFamily: 'PublicSans_700Bold' },
  cancelBtn: {
    minHeight: 58,
    borderRadius: tokens.radius.button,
    borderWidth: 2,
    borderColor: tokens.error,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.surface,
  },
  cancelBtnPressed: { backgroundColor: tokens.errorContainer },
  cancelText: { color: tokens.error, fontFamily: 'PublicSans_700Bold' },
});
