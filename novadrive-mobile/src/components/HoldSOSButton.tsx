import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import {
  holdSosHudTopInnerStyle,
  holdSosHudTopSublabelCopy,
  holdSosHudTopSublabelStyle,
  holdSosHudTopTextColumnStyle,
} from './holdSosHudTopLayout';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';
import { shouldFireHoldSosOnRelease } from '../lib/emergency/holdSosReleaseGrace';

const HOLD_MS = 1500;
const HOLD_DASHBOARD_MS = 3000;
const HOLD_HUD_TOP_MS = 3000;

/**
 * "Hold 1.5s" SOS pad. Pulses calmly while idle (saffron ring), fills on press, fires haptic +
 * triggers callback at the end of the hold. DESIGN.md §Components/Emergency HUD.
 */
export function HoldSOSButton({
  onTrigger,
  label,
  variant = 'default',
}: {
  onTrigger: () => void;
  label?: string;
  variant?: 'default' | 'dashboard' | 'hudTop';
}) {
  const isHudTop = variant === 'hudTop';
  const isDashboard = variant === 'dashboard' || isHudTop;
  const holdMs = isHudTop || variant === 'dashboard' ? HOLD_HUD_TOP_MS : HOLD_MS;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const activatedRef = useRef(false);
  const pressStartRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const idlePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (holding) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(idlePulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(idlePulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [holding, idlePulse]);

  const fireTrigger = () => {
    if (activatedRef.current) return;
    activatedRef.current = true;
    if (tick.current) clearInterval(tick.current);
    if (timer.current) clearTimeout(timer.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
    onTrigger();
    setHolding(false);
    setProgress(0);
  };

  const start = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    activatedRef.current = false;
    pressStartRef.current = Date.now();
    setHolding(true);
    setProgress(0);
    const startAt = Date.now();
    tick.current = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startAt) / holdMs));
    }, 50);
    timer.current = setTimeout(() => {
      fireTrigger();
    }, holdMs);
  };

  const cancel = () => {
    const elapsedMs = Date.now() - pressStartRef.current;
    const wasActivated = activatedRef.current;
    if (timer.current) clearTimeout(timer.current);
    if (tick.current) clearInterval(tick.current);
    setHolding(false);
    setProgress(0);
    if (wasActivated) return;
    if (shouldFireHoldSosOnRelease(elapsedMs, holdMs)) {
      fireTrigger();
    }
  };

  const ringScale = idlePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpacity = idlePulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <Pressable
      onPressIn={start}
      onPressOut={cancel}
      style={[styles.wrap, isHudTop && styles.wrapHudTop]}
      accessibilityLabel="Hold 3 seconds for emergency SOS"
    >
      <View
        style={[
          styles.frame,
          isDashboard && !isHudTop && styles.frameDashboard,
          isHudTop && styles.frameHudTop,
        ]}
      >
        {!holding ? (
          <Animated.View
            pointerEvents="none"
            style={[
              isHudTop ? styles.pulseHudTop : isDashboard ? styles.pulseDashboard : styles.pulse,
              { transform: [{ scale: ringScale }], opacity: ringOpacity },
            ]}
          />
        ) : null}
        <View
          style={[
            styles.ring,
            isDashboard && !isHudTop && styles.ringDashboard,
            isHudTop && styles.ringHudTop,
            holding && styles.ringActive,
          ]}
        >
          <View style={[styles.btn, isDashboard && !isHudTop && styles.btnDashboard, isHudTop && styles.btnHudTop]}>
            <View style={[styles.fill, { height: `${progress * 100}%` }]} />
            {isHudTop ? (
              <View style={holdSosHudTopInnerStyle}>
                <MaterialIcons name="emergency" size={36} color={tokens.onError} style={styles.icon} />
                <View style={holdSosHudTopTextColumnStyle}>
                  <HudText variant="headlineMd" style={styles.sosWordHudTop}>
                    HOLD FOR SOS
                  </HudText>
                  <HudText variant="mono" style={holdSosHudTopSublabelStyle}>
                    {holdSosHudTopSublabelCopy(holding)}
                  </HudText>
                </View>
              </View>
            ) : isDashboard ? (
              <>
                <MaterialIcons name="emergency" size={72} color={tokens.onError} style={styles.icon} />
                <HudText variant="display" style={styles.sosWord}>
                  SOS
                </HudText>
              </>
            ) : (
              <MaterialIcons name="emergency" size={42} color={tokens.onError} style={styles.icon} />
            )}
          </View>
        </View>
      </View>
      {!isHudTop ? (
        <HudText variant="mono" style={[styles.label, isDashboard && styles.labelDashboard]}>
          {label ??
            (holding
              ? 'Hold steady…'
              : isDashboard
                ? 'Hold 3s'
                : 'Hold 1.5s · SOS')}
        </HudText>
      ) : null}
    </Pressable>
  );
}

const SIZE = 132;
const SIZE_DASHBOARD = 200;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  wrapHudTop: { width: '100%', alignSelf: 'stretch' },
  frame: { width: SIZE + 24, height: SIZE + 24, alignItems: 'center', justifyContent: 'center' },
  frameDashboard: { width: SIZE_DASHBOARD + 32, height: SIZE_DASHBOARD + 32 },
  frameHudTop: { width: '100%', height: 92, alignItems: 'stretch', justifyContent: 'center' },
  pulse: {
    position: 'absolute',
    width: SIZE + 24,
    height: SIZE + 24,
    borderRadius: (SIZE + 24) / 2,
    borderWidth: 2,
    borderColor: tokens.secondary,
  },
  pulseDashboard: {
    position: 'absolute',
    width: SIZE_DASHBOARD + 32,
    height: SIZE_DASHBOARD + 32,
    borderRadius: (SIZE_DASHBOARD + 32) / 2,
    borderWidth: 2,
    borderColor: tokens.error,
  },
  pulseHudTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: tokens.radius.button,
    borderWidth: 2,
    borderColor: tokens.error,
  },
  ring: {
    width: SIZE + 8,
    height: SIZE + 8,
    borderRadius: (SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: tokens.secondaryFixedDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringActive: { borderColor: tokens.secondary, borderWidth: 3 },
  ringDashboard: {
    width: SIZE_DASHBOARD + 12,
    height: SIZE_DASHBOARD + 12,
    borderRadius: (SIZE_DASHBOARD + 12) / 2,
    borderColor: tokens.surface,
    borderWidth: 4,
  },
  ringHudTop: {
    width: '100%',
    height: 88,
    borderRadius: tokens.radius.button,
    borderColor: tokens.surface,
    borderWidth: 3,
  },
  btn: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: tokens.error,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...tokens.elevation.sos,
  },
  btnDashboard: {
    width: SIZE_DASHBOARD,
    height: SIZE_DASHBOARD,
    borderRadius: SIZE_DASHBOARD / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnHudTop: {
    width: '100%',
    height: 80,
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sosWordHudTop: {
    color: tokens.onError,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 18,
    letterSpacing: 1,
  },
  sosWord: {
    color: tokens.onError,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 40,
    lineHeight: 42,
    marginTop: -4,
    zIndex: 1,
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.onErrorContainer,
  },
  icon: { zIndex: 1 },
  label: { fontSize: 11, color: tokens.onSurfaceVariant, letterSpacing: 1.5 },
  labelDashboard: {
    fontSize: 12,
    color: tokens.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
