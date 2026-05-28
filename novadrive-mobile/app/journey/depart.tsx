import { type Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HudText } from '../../src/components/HudText';
import { RouteCalibrationPath } from '../../src/components/RouteCalibrationPath';
import { ScreenEnter } from '../../src/components/ScreenEnter';
import { useApp } from '../../src/context/AppContext';
import { tokens } from '../../src/theme/tokens';

const CALIBRATION_MS = 3200;

/**
 * Stitch `nova_drive_centered_route_calibration` — navy full-screen corridor sync before HUD.
 * `?calibrateOnly=1` runs the animation without starting a journey (profile sensor check).
 */
export default function JourneyDepartScreen() {
  const { calibrateOnly } = useLocalSearchParams<{ calibrateOnly?: string }>();
  const previewOnly = calibrateOnly === '1';
  const { a11y, startJourney, endJourney } = useApp();
  const insets = useSafeAreaInsets();
  const ran = useRef(false);
  const cancelledRef = useRef(false);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [phase, setPhase] = useState(0);

  const phases = [
    {
      title: previewOnly ? 'Checking motion sensors...' : 'Calibrating Route Corridor...',
      sub: previewOnly
        ? 'Sensor baseline preview — no journey will start'
        : 'Establishing secure connection between nodes',
    },
    {
      title: 'Syncing motion sensors...',
      sub: 'Aligning crash detection baseline',
    },
    {
      title: previewOnly ? 'Sensor check complete' : 'Arming voice watch...',
      sub: previewOnly ? 'Return to profile when ready' : 'Preparing live driving HUD',
    },
  ];

  const { title, sub } = phases[phase] ?? phases[0];

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // #region agent log
    fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run2',hypothesisId:'D1',location:'app/journey/depart.tsx:60',message:'depart calibration started',data:{previewOnly,reduceMotion:a11y.reduceMotion},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const duration = a11y.reduceMotion ? 900 : CALIBRATION_MS;
    const step = duration / 3;

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    schedule(() => {
      if (!cancelledRef.current && mountedRef.current) setPhase(1);
    }, step);
    schedule(() => {
      if (!cancelledRef.current && mountedRef.current) setPhase(2);
    }, step * 2);
    schedule(async () => {
      if (cancelledRef.current || !mountedRef.current) return;

      if (previewOnly) {
        router.back();
        return;
      }

      try {
        // #region agent log
        fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run2',hypothesisId:'D1',location:'app/journey/depart.tsx:86',message:'calling startJourney',data:{previewOnly},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        await startJourney();
        // #region agent log
        fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run2',hypothesisId:'D1',location:'app/journey/depart.tsx:89',message:'startJourney resolved',data:{cancelled:cancelledRef.current,mounted:mountedRef.current},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (cancelledRef.current || !mountedRef.current) {
          endJourney();
          return;
        }
        router.replace('/journey' as Href);
      } catch {
        // #region agent log
        fetch('http://127.0.0.1:7773/ingest/d05490f0-79d1-4fa1-b47e-bd7a9abe8ff0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85c631'},body:JSON.stringify({sessionId:'85c631',runId:'run2',hypothesisId:'D1',location:'app/journey/depart.tsx:99',message:'startJourney rejected',data:{cancelled:cancelledRef.current,mounted:mountedRef.current},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (!cancelledRef.current && mountedRef.current) {
          endJourney();
          router.back();
        }
      }
    }, duration);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [a11y.reduceMotion, startJourney, endJourney, previewOnly]);

  const cancel = () => {
    cancelledRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    endJourney();
    router.back();
  };

  return (
    <ScreenEnter variant="fade">
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.radial} pointerEvents="none" />

        <View style={styles.content}>
          <View style={styles.header}>
            <HudText variant="headlineMd" style={styles.brand}>
              NOVA DRIVE
            </HudText>
            <HudText variant="mono" style={styles.team}>
              TEAM VORTEX
            </HudText>
          </View>

          <View style={styles.center}>
            <View style={styles.statusBlock}>
              <HudText variant="headlineLg" style={styles.statusTitle}>
                {title}
              </HudText>
              <HudText variant="bodyMd" style={styles.statusSub}>
                {sub}
              </HudText>
            </View>

            <RouteCalibrationPath animate={!a11y.reduceMotion} />
          </View>

          <Pressable
            onPress={cancel}
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelPressed]}
            accessibilityRole="button"
            accessibilityLabel="Cancel calibration"
          >
            <HudText variant="bodyMd" style={styles.cancelLabel}>
              CANCEL
            </HudText>
          </Pressable>
        </View>
      </View>
    </ScreenEnter>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.primary,
  },
  radial: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,33,71,0.45)',
  },
  content: {
    flex: 1,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: tokens.spacing.sideMargin,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  header: { alignItems: 'center', gap: 4, marginTop: 24 },
  brand: {
    color: tokens.primaryFixed,
    fontFamily: 'HankenGrotesk_700Bold',
    letterSpacing: 0.5,
  },
  team: {
    color: tokens.primaryFixedDim,
    fontSize: 12,
    letterSpacing: 3,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  statusBlock: {
    alignItems: 'center',
    gap: 8,
    minHeight: 72,
    paddingHorizontal: 12,
  },
  statusTitle: {
    color: tokens.onPrimary,
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  statusSub: {
    color: tokens.primaryFixedDim,
    textAlign: 'center',
    lineHeight: 22,
  },
  cancelBtn: {
    height: 48,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPressed: { opacity: 0.88 },
  cancelLabel: {
    color: tokens.primaryFixed,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 1.2,
  },
});
