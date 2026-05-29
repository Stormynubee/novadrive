import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import type { FSMContext } from '../lib/startTriageFSM';
import { applyAnswer, getQuestion, initialState } from '../lib/startTriageFSM';
import type {
  AccessibilityPrefs,
  AppSettings,
  EmergencySession,
  Facility,
  GoldenHourPacket,
  JourneyStatus,
  IncidentType,
  LocationFix,
  MedicalProfile,
  TriageColor,
  TriageState,
  UserProfile,
} from '../lib/types';
import { announceA11y, hapticCrashAlert, speakA11y } from '../lib/a11yRuntime';
import { safetyAlertTitle } from '../lib/safetyAlert';
import { parseEmergencyText } from '../lib/parseEmergencyText';
import { buildPacket } from '../lib/ghp';
import { rankFacilities } from '../lib/facilitiesDb';
import {
  createCrashOrchestrator,
} from '../lib/crash/crashOrchestrator';
import type { CrashSource } from '../lib/crash/nativeCrashAdapter';
import {
  CRASH_CONFIG,
  createCrashEngineState,
  accelMagnitudeG,
  evaluateCrashCandidate,
  kmhFromMps,
  resetCrashDetectionCooldown,
  type CrashEvent,
} from '../lib/crashEngine';
import type { PanicVoiceEvent } from '../lib/panicVoiceEngine';
import {
  createDistressVoiceClassifierState,
  evaluateDistressVoice,
} from '../lib/voice/distressVoiceClassifier';
import {
  estimateMeteringProxies,
  extractDistressAudioFeatures,
} from '../lib/voice/distressAudioFeatures';
import {
  createVoicePolicyState,
  markNavigationTransition,
  markRecorderWarmup,
  markTtsMute,
  shouldProcessVoiceSample,
} from '../lib/voice/distressVoicePolicy';
import { runYamnetDistress } from '../lib/voice/yamnetDistressInference';
import { registerVoicePolicyHandlers } from '../lib/voice/voicePolicyBridge';
import type { SafetyAlertReason } from '../lib/safetyAlert';
import { canDetectDistressVoice, shouldEnableVoiceMonitoring } from '../lib/journeyMonitoring';
import {
  createJourneyLog,
  finalizeJourneyLog,
  incrementJourneyAlerts,
} from '../lib/journeyDb';
import {
  defaultA11y,
  defaultSettings,
  loadProfile,
  normalizeMedical,
  resetDemoApp,
  saveProfile,
} from '../lib/storage';
import { getSupabaseClient } from '../lib/supabase/client';
import { signOutSession } from '../lib/supabase/authSession';

interface AppContextValue {
  profile: UserProfile;
  a11y: AccessibilityPrefs;
  journeyStatus: JourneyStatus;
  speedKmh: number;
  session: EmergencySession;
  triageState: TriageState;
  triageCtx: FSMContext;
  triageResult?: TriageColor;
  chatPrefill?: Partial<FSMContext>;
  crashDialogOpen: boolean;
  crashSource: 'OS' | 'Sensors' | 'Manual';
  safetyAlertReason: SafetyAlertReason;
  voiceMonitoring: boolean;
  calmCountdown: number;
  startJourney: () => Promise<void>;
  ensureSafetyMonitoring: () => Promise<void>;
  endJourney: () => void;
  finishJourney: () => Promise<string | null>;
  triggerSOS: () => void;
  simulateCrash: () => void;
  simulatePanic: () => void;
  dismissCrashDialog: () => void;
  confirmCrash: () => void;
  setLocation: (loc: LocationFix) => void;
  setIncidentType: (type: IncidentType) => void;
  completeTraumaAssessment: (triage: TriageColor) => void;
  answerTriage: (value: Partial<FSMContext>) => void;
  skipTriageStep: () => void;
  parseChat: (text: string) => string[];
  selectFacility: (f: Facility) => void;
  buildGhp: () => Promise<GoldenHourPacket | null>;
  updateProfile: (p: Partial<UserProfile>) => Promise<void>;
  updateMedical: (m: MedicalProfile) => Promise<void>;
  updateA11y: (a: Partial<AccessibilityPrefs>) => Promise<void>;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  resetEmergency: () => void;
  beginEmergencyFlow: () => void;
  applyChatToTriage: (text: string) => string[];
  resetDemoToStart: () => Promise<void>;
  plannedDestination: string;
  setPlannedDestination: (label: string) => void;
  logout: () => Promise<void>;
  processVoiceMeterSample: (db: number, pcm16k?: Float32Array) => void;
  setVoiceMonitoringActive: (active: boolean) => void;
  markNavigationTransition: () => void;
  markRecorderWarmup: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({ mode: 'guest' });
  const [a11y, setA11y] = useState<AccessibilityPrefs>(defaultA11y());
  const [settings, setSettings] = useState<AppSettings>(defaultSettings());
  const a11yRef = useRef(a11y);
  const settingsRef = useRef(settings);
  const appInForegroundRef = useRef(AppState.currentState === 'active');
  const [journeyStatus, setJourneyStatus] = useState<JourneyStatus>('IDLE');
  const [speedKmh, setSpeedKmh] = useState(0);
  const [session, setSession] = useState<EmergencySession>({});
  const [triageState, setTriageState] = useState<TriageState>(initialState());
  const [triageCtx, setTriageCtx] = useState<FSMContext>({});
  const [triageResult, setTriageResult] = useState<TriageColor | undefined>();
  const [chatPrefill, setChatPrefill] = useState<Partial<FSMContext>>();
  const [crashDialogOpen, setCrashDialogOpen] = useState(false);
  const [crashSource, setCrashSource] = useState<CrashSource>('Sensors');
  const [safetyAlertReason, setSafetyAlertReason] = useState<SafetyAlertReason>('impact');
  const [voiceMonitoring, setVoiceMonitoring] = useState(false);
  const [calmCountdown, setCalmCountdown] = useState(CRASH_CONFIG.CALM_DIALOG_SECONDS);
  const [plannedDestination, setPlannedDestination] = useState('');

  const locSub = useRef<Location.LocationSubscription | null>(null);
  const accelSub = useRef<{ remove: () => void } | null>(null);
  const crashState = useRef(createCrashEngineState());
  const distressClassifierState = useRef(createDistressVoiceClassifierState());
  const yamnetInflightRef = useRef(false);
  const voicePolicyRef = useRef(createVoicePolicyState());
  const profileRef = useRef(profile);
  const speedRef = useRef(0);
  const calmTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const monitoringActive = useRef(false);
  const lastSafetyDialogAt = useRef(0);
  const journeyStatusRef = useRef(journeyStatus);
  const dialogOpenRef = useRef(false);
  const journeyLogId = useRef<string | null>(null);
  const journeyStartedAt = useRef(0);
  const journeyMaxSpeed = useRef(0);
  const impactAlertCount = useRef(0);
  const voiceAlertCount = useRef(0);

  useEffect(() => {
    journeyStatusRef.current = journeyStatus;
  }, [journeyStatus]);

  useEffect(() => {
    dialogOpenRef.current = crashDialogOpen;
  }, [crashDialogOpen]);

  useEffect(() => {
    a11yRef.current = a11y;
  }, [a11y]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    registerVoicePolicyHandlers({
      markTtsMute: (estimatedSpeechMs) => {
        voicePolicyRef.current = markTtsMute(voicePolicyRef.current, estimatedSpeechMs);
      },
    });
    return () => registerVoicePolicyHandlers(null);
  }, []);

  const markNavigationTransitionCtx = useCallback(() => {
    voicePolicyRef.current = markNavigationTransition(voicePolicyRef.current);
  }, []);

  const markRecorderWarmupCtx = useCallback(() => {
    voicePolicyRef.current = markRecorderWarmup(voicePolicyRef.current);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      appInForegroundRef.current = next === 'active';
      if (next !== 'active') {
        setVoiceMonitoring(false);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    loadProfile().then((p) => {
      setProfile(p);
      const base = defaultA11y();
      const saved = p.a11y ?? base;
      setA11y({
        ...base,
        ...saved,
        fontScale: saved.fontScale ?? (saved.largeText ? 1.15 : base.fontScale),
      });
      setSettings({ ...defaultSettings(), ...p.settings });
    });
  }, []);

  const openCrashDialog = useCallback(() => {
    setCrashDialogOpen(true);
    setCalmCountdown(CRASH_CONFIG.CALM_DIALOG_SECONDS);
    if (calmTimer.current) clearInterval(calmTimer.current);
    calmTimer.current = setInterval(() => {
      setCalmCountdown((c) => {
        if (c <= 1) {
          if (calmTimer.current) clearInterval(calmTimer.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const triggerSafetyAlert = useCallback(
    (reason: SafetyAlertReason, source: CrashSource = 'Sensors') => {
      const now = Date.now();
      if (reason !== 'simulate' && now - lastSafetyDialogAt.current < 30_000) return;
      if (dialogOpenRef.current) return;
      if (
        reason === 'voice' &&
        !canDetectDistressVoice({
          journeyActive: journeyStatusRef.current === 'ACTIVE',
          appForeground: appInForegroundRef.current,
          isFemaleSafetyHelpActive:
            profileRef.current.gender === 'female' &&
            Boolean(profileRef.current.naariShakti?.safetyModeActive),
        })
      ) {
        return;
      }
      if (
        reason === 'impact' &&
        (journeyStatusRef.current !== 'ACTIVE' || !appInForegroundRef.current)
      ) {
        return;
      }
      lastSafetyDialogAt.current = now;
      if (reason === 'impact') {
        impactAlertCount.current += 1;
        if (journeyLogId.current) void incrementJourneyAlerts(journeyLogId.current, 'impact');
      }
      if (reason === 'voice') {
        voiceAlertCount.current += 1;
        if (journeyLogId.current) void incrementJourneyAlerts(journeyLogId.current, 'voice');
      }
      setSafetyAlertReason(reason);
      setCrashSource(source);
      const prefs = a11yRef.current;
      void hapticCrashAlert(prefs);
      announceA11y(safetyAlertTitle(reason), prefs);
      speakA11y(safetyAlertTitle(reason), prefs);
      openCrashDialog();
    },
    [openCrashDialog]
  );

  const handleCrashEvent = useCallback(
    (event: CrashEvent) => {
      if (event === 'CRASH_CANDIDATE') triggerSafetyAlert('impact', 'Sensors');
      if (event === 'SIMULATE_CRASH') triggerSafetyAlert('simulate', 'Manual');
    },
    [triggerSafetyAlert]
  );

  const crashOrchestratorRef = useRef(
    createCrashOrchestrator({
      journeyActive: () => journeyStatusRef.current === 'ACTIVE',
      onCandidate: (source) => triggerSafetyAlert('impact', source),
    })
  );

  useEffect(() => {
    return crashOrchestratorRef.current.unsubscribe;
  }, []);

  const handlePanicEvent = useCallback(
    (event: PanicVoiceEvent) => {
      if (event === 'PANIC_CANDIDATE') triggerSafetyAlert('voice');
    },
    [triggerSafetyAlert]
  );

  const startLocationWatch = useCallback(async () => {
    if (locSub.current) return;
    locSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 5, timeInterval: 2000 },
      (pos) => {
        const kmh = kmhFromMps(pos.coords.speed ?? 0);
        speedRef.current = Math.max(0, kmh);
        journeyMaxSpeed.current = Math.max(journeyMaxSpeed.current, speedRef.current);
        setSpeedKmh(Math.round(speedRef.current));
        const { state, event } = evaluateCrashCandidate(
          crashState.current,
          speedRef.current,
          null,
          Date.now(),
          settingsRef.current.sosSensitivity
        );
        crashState.current = state;
        if (event) handleCrashEvent(event);
      }
    );
  }, [handleCrashEvent]);

  const startAccelWatch = useCallback(() => {
    if (accelSub.current) return;
    Accelerometer.setUpdateInterval(80);
    accelSub.current = Accelerometer.addListener(({ x, y, z }) => {
      const mag = accelMagnitudeG(x, y, z);
      const { state, event } = evaluateCrashCandidate(
        crashState.current,
        speedRef.current,
        mag,
        Date.now(),
        settingsRef.current.sosSensitivity
      );
      crashState.current = state;
      if (event) handleCrashEvent(event);
    });
  }, [handleCrashEvent]);

  const processVoiceMeterSample = useCallback(
    (db: number, pcm16k?: Float32Array) => {
      if (
        !canDetectDistressVoice({
          journeyActive: journeyStatusRef.current === 'ACTIVE',
          appForeground: appInForegroundRef.current,
          isFemaleSafetyHelpActive:
            profileRef.current.gender === 'female' &&
            Boolean(profileRef.current.naariShakti?.safetyModeActive),
        })
      ) {
        return;
      }
      if (!shouldEnableVoiceMonitoring(settingsRef.current)) return;

      const now = Date.now();
      const policyCheck = shouldProcessVoiceSample({
        ...voicePolicyRef.current,
        now,
      });
      if (!policyCheck) return;

      const panic = distressClassifierState.current.panic;
      const above = panic.calibrated ? db - panic.baselineDb : 0;
      const features =
        pcm16k && pcm16k.length > 0
          ? extractDistressAudioFeatures(pcm16k)
          : estimateMeteringProxies(db, above);

      const sensitivity = settingsRef.current.voiceDistressSensitivity ?? 'medium';
      const evaluate = (yamnetDistress?: number) => {
        const { state, alert } = evaluateDistressVoice(
          distressClassifierState.current,
          { meteringDb: db, features, yamnetDistress },
          { now, sensitivity }
        );
        distressClassifierState.current = state;
        if (alert) handlePanicEvent('PANIC_CANDIDATE');
      };

      evaluate();

      if (
        pcm16k &&
        pcm16k.length >= 16_000 &&
        !yamnetInflightRef.current
      ) {
        yamnetInflightRef.current = true;
        void runYamnetDistress(pcm16k).then((yamnet) => {
          yamnetInflightRef.current = false;
          if (!yamnet || yamnet.suppressed) return;
          if (
            !canDetectDistressVoice({
              journeyActive: journeyStatusRef.current === 'ACTIVE',
              appForeground: appInForegroundRef.current,
              isFemaleSafetyHelpActive:
                profileRef.current.gender === 'female' &&
                Boolean(profileRef.current.naariShakti?.safetyModeActive),
            })
          ) {
            return;
          }
          evaluate(yamnet.distress);
        });
      }
    },
    [handlePanicEvent]
  );

  const setVoiceMonitoringActive = useCallback((active: boolean) => {
    setVoiceMonitoring(active);
  }, []);

  const ensureSafetyMonitoring = useCallback(async () => {
    if (journeyStatusRef.current !== 'ACTIVE') return;

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return;

    await startLocationWatch();
    startAccelWatch();
    monitoringActive.current = true;
  }, [startLocationWatch, startAccelWatch]);

  const resetJourneyRuntime = useCallback(() => {
    setJourneyStatus('IDLE');
    journeyStatusRef.current = 'IDLE';
    setSpeedKmh(0);
    speedRef.current = 0;
    setPlannedDestination('');
    crashState.current = createCrashEngineState();
    distressClassifierState.current = createDistressVoiceClassifierState();
    voicePolicyRef.current = createVoicePolicyState();
    lastSafetyDialogAt.current = 0;
    journeyLogId.current = null;
    journeyStartedAt.current = 0;
    journeyMaxSpeed.current = 0;
    impactAlertCount.current = 0;
    voiceAlertCount.current = 0;
    setCrashDialogOpen(false);
    if (calmTimer.current) clearInterval(calmTimer.current);
  }, []);

  const startJourney = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location needed',
        'Margi needs location access to monitor your corridor while driving.',
        [{ text: 'OK' }]
      );
      throw new Error('Location permission required for journey mode.');
    }
    setJourneyStatus('ACTIVE');
    journeyStatusRef.current = 'ACTIVE';
    crashState.current = createCrashEngineState();
    distressClassifierState.current = createDistressVoiceClassifierState();
    voicePolicyRef.current = createVoicePolicyState();
    lastSafetyDialogAt.current = 0;
    journeyStartedAt.current = Date.now();
    journeyMaxSpeed.current = 0;
    impactAlertCount.current = 0;
    voiceAlertCount.current = 0;
    try {
      journeyLogId.current = await createJourneyLog(
        plannedDestination || 'Corridor A → B'
      );
    } catch {
      journeyLogId.current = null;
    }
    await ensureSafetyMonitoring();
    if (shouldEnableVoiceMonitoring(settingsRef.current)) {
      setVoiceMonitoring(true);
    }
  }, [ensureSafetyMonitoring, plannedDestination]);

  const stopSensors = useCallback(async () => {
    monitoringActive.current = false;
    locSub.current?.remove();
    locSub.current = null;
    accelSub.current?.remove();
    accelSub.current = null;
    setVoiceMonitoring(false);
  }, []);

  const endJourney = useCallback(() => {
    void stopSensors();
    resetJourneyRuntime();
  }, [stopSensors, resetJourneyRuntime]);

  const finishJourney = useCallback(async (): Promise<string | null> => {
    const id = journeyLogId.current;
    const durationSec =
      journeyStartedAt.current > 0
        ? Math.max(0, Math.round((Date.now() - journeyStartedAt.current) / 1000))
        : 0;
    if (id) {
      try {
        await finalizeJourneyLog(id, {
          maxSpeedKmh: journeyMaxSpeed.current,
          impactAlerts: impactAlertCount.current,
          voiceAlerts: voiceAlertCount.current,
          durationSec,
        });
      } catch {
        /* keep navigation working if DB fails */
      }
    }
    journeyLogId.current = null;
    endJourney();
    return id;
  }, [endJourney]);

  const triggerSOS = useCallback(() => {
    if (journeyStatusRef.current !== 'ACTIVE') return;
  }, []);

  const simulateCrash = useCallback(() => {
    lastSafetyDialogAt.current = 0;
    handleCrashEvent('SIMULATE_CRASH');
  }, [handleCrashEvent]);

  const simulatePanic = useCallback(() => {
    lastSafetyDialogAt.current = 0;
    triggerSafetyAlert('voice');
  }, [triggerSafetyAlert]);

  const dismissCrashDialog = useCallback(() => {
    setCrashDialogOpen(false);
    if (calmTimer.current) clearInterval(calmTimer.current);
    resetCrashDetectionCooldown(crashState.current);
    distressClassifierState.current = createDistressVoiceClassifierState();
    voicePolicyRef.current = createVoicePolicyState();
    lastSafetyDialogAt.current = 0;
  }, []);

  const confirmCrash = useCallback(() => {
    dismissCrashDialog();
    // User must explicitly continue — no auto triage at countdown 0
  }, [dismissCrashDialog]);

  const setLocation = useCallback((loc: LocationFix) => {
    setSession((s) => ({ ...s, location: loc }));
  }, []);

  const setIncidentType = useCallback((incidentType: IncidentType) => {
    setSession((s) => ({ ...s, incidentType }));
  }, []);

  const completeTraumaAssessment = useCallback((triage: TriageColor) => {
    setTriageResult(triage);
    setSession((s) => ({ ...s, triage }));
  }, []);

  const answerTriage = useCallback(
    (value: Partial<FSMContext>) => {
      const mergedCtx = { ...triageCtx, ...chatPrefill, ...value };
      const { next, result, ctx } = applyAnswer(triageState, mergedCtx, value);
      setTriageCtx(ctx);
      setTriageState(next);
      if (result) {
        setTriageResult(result);
        setSession((s) => ({ ...s, triage: result }));
      }
    },
    [triageState, triageCtx, chatPrefill]
  );

  const skipTriageStep = useCallback(() => {
    if (!chatPrefill) return;
    answerTriage(chatPrefill);
    setChatPrefill(undefined);
  }, [answerTriage, chatPrefill]);

  const parseChat = useCallback((text: string) => {
    const { slots, matched } = parseEmergencyText(text);
    if (Object.keys(slots).length > 0) setChatPrefill((p) => ({ ...p, ...slots }));
    return matched;
  }, []);

  const slotsForCurrentStep = useCallback(
    (slots: Partial<FSMContext>): Partial<FSMContext> | null => {
      switch (triageState) {
        case 'AMBULATORY':
          return slots.canWalk !== undefined ? { canWalk: slots.canWalk } : null;
        case 'BREATHING_CHECK':
          return slots.breathing !== undefined ? { breathing: slots.breathing } : null;
        case 'AIRWAY_REPOSITION':
          return slots.airwayOk !== undefined || slots.breathing !== undefined
            ? { airwayOk: slots.airwayOk ?? slots.breathing, breathing: slots.breathing ?? slots.airwayOk }
            : null;
        case 'RESPIRATORY_RATE':
          return slots.respiratoryRateOver30 !== undefined
            ? { respiratoryRateOver30: slots.respiratoryRateOver30 }
            : null;
        case 'PERFUSION_CHECK':
          return slots.capillaryRefillOk !== undefined ? { capillaryRefillOk: slots.capillaryRefillOk } : null;
        case 'MENTAL_STATUS':
          return slots.followsCommands !== undefined ? { followsCommands: slots.followsCommands } : null;
        default:
          return null;
      }
    },
    [triageState]
  );

  const applyChatToTriage = useCallback(
    (text: string) => {
      const { slots, matched } = parseEmergencyText(text);
      if (Object.keys(slots).length > 0) setChatPrefill((p) => ({ ...p, ...slots }));
      const stepSlots = slotsForCurrentStep(slots);
      if (stepSlots) answerTriage(stepSlots);
      return matched;
    },
    [answerTriage, slotsForCurrentStep]
  );

  const selectFacility = useCallback((f: Facility) => {
    setSession((s) => ({ ...s, facility: f }));
  }, []);

  const buildGhp = useCallback(async () => {
    const packet = await buildPacket(session, profile.medical);
    if (packet) setSession((s) => ({ ...s, packet }));
    return packet;
  }, [session, profile.medical]);

  const updateProfile = useCallback(async (p: Partial<UserProfile>) => {
    const next = { ...profile, ...p };
    setProfile(next);
    await saveProfile(next);
  }, [profile]);

  const updateMedical = useCallback(
    async (m: MedicalProfile) => {
      await updateProfile({ medical: normalizeMedical(m) });
    },
    [updateProfile]
  );

  const updateA11y = useCallback(
    async (patch: Partial<AccessibilityPrefs>) => {
      const next = { ...a11y, ...patch };
      setA11y(next);
      a11yRef.current = next;
      await updateProfile({ a11y: next });
    },
    [a11y, updateProfile]
  );

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await updateProfile({ settings: next });
    },
    [settings, updateProfile]
  );

  const resetEmergency = useCallback(() => {
    setSession({});
    setTriageState(initialState());
    setTriageCtx({});
    setTriageResult(undefined);
    setChatPrefill(undefined);
  }, []);

  const beginEmergencyFlow = useCallback(() => {
    resetEmergency();
    setSession({ incidentType: 'road_accident' });
  }, [resetEmergency]);

  const resetDemoToStart = useCallback(async () => {
    endJourney();
    dismissCrashDialog();
    await resetDemoApp();
    setProfile({ mode: 'guest' });
    setA11y(defaultA11y());
    setSettings(defaultSettings());
    resetEmergency();
    setJourneyStatus('IDLE');
    setSpeedKmh(0);
    setPlannedDestination('');
  }, [endJourney, dismissCrashDialog, resetEmergency]);

  const logout = useCallback(async () => {
    endJourney();
    dismissCrashDialog();
    resetEmergency();
    setPlannedDestination('');
    const client = getSupabaseClient();
    if (client) await signOutSession(client);
    const guest: UserProfile = { mode: 'guest' };
    setProfile(guest);
    await saveProfile(guest);
    setJourneyStatus('IDLE');
    setSpeedKmh(0);
  }, [endJourney, dismissCrashDialog, resetEmergency]);

  const value = useMemo(
    () => ({
      profile,
      a11y,
      settings,
      journeyStatus,
      speedKmh,
      session,
      triageState,
      triageCtx,
      triageResult,
      chatPrefill,
      crashDialogOpen,
      crashSource,
      safetyAlertReason,
      voiceMonitoring,
      calmCountdown,
      startJourney,
      ensureSafetyMonitoring,
      endJourney,
      finishJourney,
      triggerSOS,
      simulateCrash,
      simulatePanic,
      dismissCrashDialog,
      confirmCrash,
      setLocation,
      setIncidentType,
      completeTraumaAssessment,
      answerTriage,
      skipTriageStep,
      parseChat,
      selectFacility,
      buildGhp,
      updateProfile,
      updateMedical,
      updateA11y,
      updateSettings,
      resetEmergency,
      beginEmergencyFlow,
      applyChatToTriage,
      resetDemoToStart,
      plannedDestination,
      setPlannedDestination,
      logout,
      processVoiceMeterSample,
      setVoiceMonitoringActive,
      markNavigationTransition: markNavigationTransitionCtx,
      markRecorderWarmup: markRecorderWarmupCtx,
    }),
    [
      profile,
      a11y,
      settings,
      journeyStatus,
      speedKmh,
      session,
      triageState,
      triageCtx,
      triageResult,
      chatPrefill,
      crashDialogOpen,
      crashSource,
      safetyAlertReason,
      voiceMonitoring,
      calmCountdown,
      startJourney,
      ensureSafetyMonitoring,
      endJourney,
      finishJourney,
      triggerSOS,
      simulateCrash,
      simulatePanic,
      dismissCrashDialog,
      confirmCrash,
      setLocation,
      setIncidentType,
      completeTraumaAssessment,
      answerTriage,
      skipTriageStep,
      parseChat,
      selectFacility,
      buildGhp,
      updateProfile,
      updateMedical,
      updateA11y,
      updateSettings,
      resetEmergency,
      beginEmergencyFlow,
      applyChatToTriage,
      resetDemoToStart,
      plannedDestination,
      logout,
      processVoiceMeterSample,
      setVoiceMonitoringActive,
      markNavigationTransitionCtx,
      markRecorderWarmupCtx,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { getQuestion };
