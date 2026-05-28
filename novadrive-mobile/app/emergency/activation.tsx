import { type Href, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { HudText } from '../../src/components/HudText';
import { LanguageSelector } from '../../src/components/emergency/LanguageSelector';
import { useApp } from '../../src/context/AppContext';
import {
  ACTIVATION_SPLASH_SECONDS,
  shouldNavigateToResponse,
  type ActivationMode,
} from '../../src/lib/emergency/activationAuto';
import {
  EMERGENCY_RESPONSE_PATH,
  EMERGENCY_SELECTION_PATH,
} from '../../src/lib/emergency/emergencyNavigation';
import { tokens } from '../../src/theme/tokens';

const ROTATING_STATUS = [
  'SYNCHRONIZING WITH NEAREST TRAUMA CENTER...',
  'ALERTING LOCAL POLICE UNIT...',
  'ESTABLISHING SECURE PIPELINE...',
  'TRANSMITTING CRITICAL BIOMETRICS...',
  'NOTIFYING EMERGENCY CONTACTS...',
];

export default function EmergencyActivationScreen() {
  const { settings, updateSettings, session, resetEmergency } = useApp();
  const [statusIndex, setStatusIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ACTIVATION_SPLASH_SECONDS);
  const [mode, setMode] = useState<ActivationMode>('auto');
  const [backendReady, setBackendReady] = useState(false);
  const hasAutoNavigatedRef = useRef(false);
  const status = useMemo(() => ROTATING_STATUS[statusIndex % ROTATING_STATUS.length], [statusIndex]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run1',hypothesisId:'H2',location:'app/emergency/activation.tsx:30',message:'incidentType guard effect',data:{incidentType:session.incidentType ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!session.incidentType) {
      router.replace('/emergency/selection' as Href);
    }
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
    // #region agent log
    fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run1',hypothesisId:'H3',location:'app/emergency/activation.tsx:38',message:'countdown effect mounted',data:{modeAtMount:mode,secondsLeftAtMount:secondsLeft},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const countdownTimer = setInterval(() => {
      setSecondsLeft((value) => {
        // #region agent log
        fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run1',hypothesisId:'H1',location:'app/emergency/activation.tsx:43',message:'countdown tick updater',data:{value,modeCaptured:mode},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
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

  const navigateToResponse = (selectedMode: ActivationMode) => {
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
    // #region agent log
    fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'post-fix',hypothesisId:'H1',location:'app/emergency/activation.tsx:62',message:'auto navigation triggered from effect',data:{secondsLeft,mode,target:`${EMERGENCY_RESPONSE_PATH}?mode=${mode}`},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    navigateToResponse(mode);
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
          TRAUMA RESPONSE
        </HudText>
        <Pressable onPress={() => router.replace(EMERGENCY_SELECTION_PATH as Href)}>
          <MaterialIcons name="emergency-share" size={22} color={tokens.onPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.shieldWrap}>
          <View style={styles.shieldOuter}>
            <MaterialIcons name="shield" size={96} color={tokens.primary} />
          </View>
        </View>

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

        <View style={styles.modeWrap}>
          <Pressable
            style={[styles.modeButton, mode === 'auto' && styles.modeButtonActive]}
            onPress={() => setMode('auto')}
          >
            <HudText variant="bodySm" style={[styles.modeText, mode === 'auto' && styles.modeTextActive]}>
              Auto System
            </HudText>
          </Pressable>
          <Pressable
            style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
            onPress={() => setMode('manual')}
          >
            <HudText
              variant="bodySm"
              style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}
            >
              Manual System
            </HudText>
          </Pressable>
        </View>

        <Pressable
          style={styles.continueButton}
          onPress={() => {
            // #region agent log
            fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run1',hypothesisId:'H4',location:'app/emergency/activation.tsx:126',message:'manual continue pressed',data:{mode,secondsLeft,target:`${EMERGENCY_RESPONSE_PATH}?mode=${mode}`},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            hasAutoNavigatedRef.current = true;
            navigateToResponse(mode);
          }}
        >
          <HudText variant="bodyMd" style={styles.continueText}>
            {mode === 'auto' && secondsLeft > 0 ? `Continue in ${secondsLeft}s` : 'Continue'}
          </HudText>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <HudText variant="mono" style={styles.footerTitle}>
          SARTHI AI ACTIVE
        </HudText>
        <Pressable style={styles.cancelBtn} onPress={cancelFlow}>
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
  root: { flex: 1, backgroundColor: tokens.surface, paddingTop: 24 },
  header: {
    height: 64,
    backgroundColor: tokens.primary,
    paddingHorizontal: tokens.spacing.sideMargin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: tokens.onPrimary, fontFamily: 'HankenGrotesk_700Bold' },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingVertical: tokens.spacing.stackLg,
    gap: tokens.spacing.stackLg,
    justifyContent: 'center',
  },
  shieldWrap: { alignItems: 'center', justifyContent: 'center' },
  shieldOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: tokens.secondary,
    backgroundColor: tokens.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusWrap: { gap: 8, alignItems: 'center' },
  statusText: { textAlign: 'center', color: tokens.primary, fontFamily: 'HankenGrotesk_700Bold' },
  protocolText: {
    color: tokens.onSurfaceVariant,
    letterSpacing: 1.1,
    textAlign: 'center',
    fontFamily: 'PublicSans_700Bold',
  },
  continueButton: {
    minHeight: 54,
    borderRadius: tokens.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.primary,
  },
  continueText: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  modeWrap: { flexDirection: 'row', gap: 8 },
  modeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.surface,
  },
  modeButtonActive: { borderColor: tokens.primary, backgroundColor: tokens.primary },
  modeText: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  modeTextActive: { color: tokens.onPrimary },
  footer: {
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
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
  },
  cancelText: { color: tokens.error, fontFamily: 'PublicSans_700Bold' },
});
