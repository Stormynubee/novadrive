import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import type { FSMContext } from '../lib/startTriageFSM';
import { applyAnswer, getQuestion, initialState } from '../lib/startTriageFSM';
import type {
  AccessibilityPrefs,
  EmergencySession,
  Facility,
  GoldenHourPacket,
  JourneyStatus,
  LocationFix,
  MedicalProfile,
  TriageColor,
  TriageState,
  UserProfile,
} from '../lib/types';
import { parseEmergencyText } from '../lib/parseEmergencyText';
import { buildPacket } from '../lib/ghp';
import { rankFacilities } from '../lib/facilitiesDb';
import {
  CRASH_CONFIG,
  createCrashEngineState,
  evaluateCrashCandidate,
  kmhFromMps,
  type CrashEvent,
} from '../lib/crashEngine';
import { defaultA11y, defaultMedical, loadProfile, saveProfile } from '../lib/storage';

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
  calmCountdown: number;
  startJourney: () => Promise<void>;
  endJourney: () => void;
  triggerSOS: () => void;
  simulateCrash: () => void;
  dismissCrashDialog: () => void;
  confirmCrash: () => void;
  setLocation: (loc: LocationFix) => void;
  answerTriage: (value: Partial<FSMContext>) => void;
  skipTriageStep: () => void;
  parseChat: (text: string) => string[];
  selectFacility: (f: Facility) => void;
  buildGhp: () => Promise<GoldenHourPacket | null>;
  updateProfile: (p: Partial<UserProfile>) => Promise<void>;
  updateMedical: (m: MedicalProfile) => Promise<void>;
  updateA11y: (a: Partial<AccessibilityPrefs>) => Promise<void>;
  resetEmergency: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({ mode: 'guest' });
  const [a11y, setA11y] = useState<AccessibilityPrefs>(defaultA11y());
  const [journeyStatus, setJourneyStatus] = useState<JourneyStatus>('IDLE');
  const [speedKmh, setSpeedKmh] = useState(0);
  const [session, setSession] = useState<EmergencySession>({});
  const [triageState, setTriageState] = useState<TriageState>(initialState());
  const [triageCtx, setTriageCtx] = useState<FSMContext>({});
  const [triageResult, setTriageResult] = useState<TriageColor | undefined>();
  const [chatPrefill, setChatPrefill] = useState<Partial<FSMContext>>();
  const [crashDialogOpen, setCrashDialogOpen] = useState(false);
  const [calmCountdown, setCalmCountdown] = useState(CRASH_CONFIG.CALM_DIALOG_SECONDS);

  const locSub = useRef<Location.LocationSubscription | null>(null);
  const accelSub = useRef<{ remove: () => void } | null>(null);
  const crashState = useRef(createCrashEngineState());
  const speedRef = useRef(0);
  const calmTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadProfile().then((p) => {
      setProfile(p);
      setA11y(p.a11y ?? defaultA11y());
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

  const handleCrashEvent = useCallback(
    (event: CrashEvent) => {
      if (event === 'CRASH_CANDIDATE' || event === 'SIMULATE_CRASH') openCrashDialog();
    },
    [openCrashDialog]
  );

  const startJourney = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Location permission required for journey mode.');
    setJourneyStatus('ACTIVE');
    crashState.current = createCrashEngineState();

    locSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 5, timeInterval: 2000 },
      (pos) => {
        const kmh = kmhFromMps(pos.coords.speed ?? 0);
        speedRef.current = Math.max(0, kmh);
        setSpeedKmh(Math.round(speedRef.current));
        const { state, event } = evaluateCrashCandidate(
          crashState.current,
          speedRef.current,
          crashState.current.peakAccelInWindow,
          Date.now()
        );
        crashState.current = state;
        if (event) handleCrashEvent(event);
      }
    );

    Accelerometer.setUpdateInterval(200);
    accelSub.current = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      const { state, event } = evaluateCrashCandidate(
        crashState.current,
        speedRef.current,
        mag,
        Date.now()
      );
      crashState.current = state;
      if (event) handleCrashEvent(event);
    });
  }, [handleCrashEvent]);

  const stopSensors = useCallback(() => {
    locSub.current?.remove();
    locSub.current = null;
    accelSub.current?.remove();
    accelSub.current = null;
  }, []);

  const endJourney = useCallback(() => {
    setJourneyStatus('ENDED');
    stopSensors();
  }, [stopSensors]);

  const triggerSOS = useCallback(() => {
    setJourneyStatus('ACTIVE');
  }, []);

  const simulateCrash = useCallback(() => {
    handleCrashEvent('SIMULATE_CRASH');
  }, [handleCrashEvent]);

  const dismissCrashDialog = useCallback(() => {
    setCrashDialogOpen(false);
    if (calmTimer.current) clearInterval(calmTimer.current);
  }, []);

  const confirmCrash = useCallback(() => {
    dismissCrashDialog();
    // User must explicitly continue — no auto triage at countdown 0
  }, [dismissCrashDialog]);

  const setLocation = useCallback((loc: LocationFix) => {
    setSession((s) => ({ ...s, location: loc }));
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

  const selectFacility = useCallback((f: Facility) => {
    setSession((s) => ({ ...s, facility: f }));
  }, []);

  const buildGhp = useCallback(async () => {
    const packet = await buildPacket(session);
    if (packet) setSession((s) => ({ ...s, packet }));
    return packet;
  }, [session]);

  const updateProfile = useCallback(async (p: Partial<UserProfile>) => {
    const next = { ...profile, ...p };
    setProfile(next);
    await saveProfile(next);
  }, [profile]);

  const updateMedical = useCallback(
    async (m: MedicalProfile) => {
      await updateProfile({ medical: m });
    },
    [updateProfile]
  );

  const updateA11y = useCallback(
    async (patch: Partial<AccessibilityPrefs>) => {
      const next = { ...a11y, ...patch };
      setA11y(next);
      await updateProfile({ a11y: next });
    },
    [a11y, updateProfile]
  );

  const resetEmergency = useCallback(() => {
    setSession({});
    setTriageState(initialState());
    setTriageCtx({});
    setTriageResult(undefined);
    setChatPrefill(undefined);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      a11y,
      journeyStatus,
      speedKmh,
      session,
      triageState,
      triageCtx,
      triageResult,
      chatPrefill,
      crashDialogOpen,
      calmCountdown,
      startJourney,
      endJourney,
      triggerSOS,
      simulateCrash,
      dismissCrashDialog,
      confirmCrash,
      setLocation,
      answerTriage,
      skipTriageStep,
      parseChat,
      selectFacility,
      buildGhp,
      updateProfile,
      updateMedical,
      updateA11y,
      resetEmergency,
    }),
    [
      profile,
      a11y,
      journeyStatus,
      speedKmh,
      session,
      triageState,
      triageCtx,
      triageResult,
      chatPrefill,
      crashDialogOpen,
      calmCountdown,
      startJourney,
      endJourney,
      triggerSOS,
      simulateCrash,
      dismissCrashDialog,
      confirmCrash,
      setLocation,
      answerTriage,
      skipTriageStep,
      parseChat,
      selectFacility,
      buildGhp,
      updateProfile,
      updateMedical,
      updateA11y,
      resetEmergency,
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
