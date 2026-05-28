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
  CRASH_CONFIG,
  createCrashEngineState,
  accelMagnitudeG,
  evaluateCrashCandidate,
  kmhFromMps,
  resetCrashDetectionCooldown,
  type CrashEvent,
} from '../lib/crashEngine';
import {
  createPanicVoiceState,
  evaluatePanicVoice,
  type PanicVoiceEvent,
} from '../lib/panicVoiceEngine';
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
  processVoiceMeterSample: (db: number) => void;
  setVoiceMonitoringActive: (active: boolean) => void;
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
  const [safetyAlertReason, setSafetyAlertReason] = useState<SafetyAlertReason>('impact');
  const [voiceMonitoring, setVoiceMonitoring] = useState(false);
  const [calmCountdown, setCalmCountdown] = useState(CRASH_CONFIG.CALM_DIALOG_SECONDS);
  const [plannedDestination, setPlannedDestination] = useState('');

  const locSub = useRef<Location.LocationSubscription | null>(null);
  const accelSub = useRef<{ remove: () => void } | null>(null);
  const crashState = useRef(createCrashEngineState());
  const panicState = useRef(createPanicVoiceState());
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
    (reason: SafetyAlertReason) => {
      const now = Date.now();
      // #region agent log
      fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run3',hypothesisId:'B6',location:'src/context/AppContext.tsx:199',message:'triggerSafetyAlert invoked',data:{reason,journeyStatus:journeyStatusRef.current,appForeground:appInForegroundRef.current,dialogOpen:dialogOpenRef.current},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (reason !== 'simulate' && now - lastSafetyDialogAt.current < 30_000) return;
      if (dialogOpenRef.current) return;
      if (
        reason === 'voice' &&
        !canDetectDistressVoice({
          journeyActive: journeyStatusRef.current === 'ACTIVE',
          appForeground: appInForegroundRef.current,
          isFemaleSafetyHelpActive:
            profile.gender === 'female' && Boolean(profile.naariShakti?.safetyModeActive),
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
      if (event === 'CRASH_CANDIDATE') triggerSafetyAlert('impact');
      if (event === 'SIMULATE_CRASH') triggerSafetyAlert('simulate');
    },
    [triggerSafetyAlert]
  );

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
    (db: number) => {
      if (
        !canDetectDistressVoice({
          journeyActive: journeyStatusRef.current === 'ACTIVE',
          appForeground: appInForegroundRef.current,
          isFemaleSafetyHelpActive:
            profile.gender === 'female' && Boolean(profile.naariShakti?.safetyModeActive),
        })
      ) {
        return;
      }
      if (!shouldEnableVoiceMonitoring(settingsRef.current)) return;
      const { state, event } = evaluatePanicVoice(panicState.current, db, Date.now());
      panicState.current = state;
      if (event === 'PANIC_CANDIDATE') handlePanicEvent(event);
    },
    [handlePanicEvent, profile.gender, profile.naariShakti?.safetyModeActive]
  );

  const setVoiceMonitoringActive = useCallback((active: boolean) => {
    setVoiceMonitoring(active);
  }, []);

  const ensureSafetyMonitoring = useCallback(async () => {
    if (journeyStatusRef.current !== 'ACTIVE') return;

    const { status } = await Location.getForegroundPermissionsAsync();
    // #region agent log
    fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run2',hypothesisId:'D2',location:'src/context/AppContext.tsx:305',message:'ensureSafetyMonitoring permission check',data:{status,journeyStatus:journeyStatusRef.current},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
    panicState.current = createPanicVoiceState();
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
    // #region agent log
    fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run2',hypothesisId:'D2',location:'src/context/AppContext.tsx:333',message:'startJourney permission request result',data:{status,plannedDestination},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (status !== 'granted') {
      Alert.alert(
        'Location needed',
        'NovaDrive needs location access to monitor your corridor while driving.',
        [{ text: 'OK' }]
      );
      throw new Error('Location permission required for journey mode.');
    }
    setJourneyStatus('ACTIVE');
    journeyStatusRef.current = 'ACTIVE';
    crashState.current = createCrashEngineState();
    panicState.current = createPanicVoiceState();
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
    // #region agent log
    fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run2',hypothesisId:'D2',location:'src/context/AppContext.tsx:362',message:'startJourney post ensureSafetyMonitoring',data:{voiceCrashDetection:settingsRef.current.voiceCrashDetection,journeyStatus:journeyStatusRef.current},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
    panicState.current = createPanicVoiceState();
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
