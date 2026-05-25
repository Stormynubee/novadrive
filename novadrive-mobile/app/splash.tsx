import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { HudText } from '../src/components/HudText';
import { NovaButton } from '../src/components/NovaButton';
import { useApp } from '../src/context/AppContext';
import { tokens } from '../src/theme/tokens';

/**
 * Stitch `nova_drive_professional_splash_screen` — deep navy field, Ashoka-Chakra-tinted shield
 * with NOVA DRIVE wordmark, three pulsing saffron loading dots, "Get started" CTA.
 */
export default function SplashScreen() {
  const { a11y } = useApp();
  const [ready, setReady] = useState(a11y.reduceMotion);
  const logoOpacity = useRef(new Animated.Value(a11y.reduceMotion ? 1 : 0)).current;
  const logoScale = useRef(new Animated.Value(a11y.reduceMotion ? 1 : 0.85)).current;
  const textOpacity = useRef(new Animated.Value(a11y.reduceMotion ? 1 : 0)).current;
  const btnOpacity = useRef(new Animated.Value(a11y.reduceMotion ? 1 : 0)).current;

  const dot1 = useRef(new Animated.Value(0.4)).current;
  const dot2 = useRef(new Animated.Value(0.4)).current;
  const dot3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!a11y.reduceMotion) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.spring(logoScale, { toValue: 1, friction: 7, useNativeDriver: true }),
        ]),
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(btnOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]).start(() => setReady(true));
    }

    const seq = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: 600,
            delay,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0.4,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

    const a = seq(dot1, 0);
    const b = seq(dot2, 200);
    const c = seq(dot3, 400);
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [a11y.reduceMotion, logoOpacity, logoScale, textOpacity, btnOpacity, dot1, dot2, dot3]);

  const onStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push('/auth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Faint Ashoka-chakra style watermark */}
      <View style={styles.watermark}>
        <Svg width={280} height={280} viewBox="0 0 280 280">
          <Circle
            cx={140}
            cy={140}
            r={120}
            stroke="rgba(174,199,246,0.12)"
            strokeWidth={1.5}
            fill="none"
          />
          <Circle
            cx={140}
            cy={140}
            r={86}
            stroke="rgba(174,199,246,0.08)"
            strokeWidth={1}
            fill="none"
          />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            return (
              <Path
                key={i}
                d={`M140 30 L140 70`}
                stroke="rgba(174,199,246,0.08)"
                strokeWidth={1}
                transform={`rotate(${angle} 140 140)`}
              />
            );
          })}
        </Svg>
      </View>

      <Animated.View
        style={[
          styles.center,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.shieldTile}>
          <Svg width={80} height={80} viewBox="0 0 96 96">
            <Path
              d="M48 6 L84 18 V46 C84 70 66 86 48 92 C30 86 12 70 12 46 V18 Z"
              fill={tokens.onPrimary}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
            />
            <Path
              d="M30 60 L48 30 L66 60"
              stroke={tokens.secondary}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx={48} cy={70} r={4} fill={tokens.tertiaryFixedDim} />
          </Svg>
        </View>

        <HudText
          variant="display"
          style={[
            styles.wordmark,
            { color: tokens.onPrimary, fontFamily: 'HankenGrotesk_800ExtraBold' },
          ]}
        >
          NOVA DRIVE
        </HudText>
        <View style={styles.divider} />
      </Animated.View>

      <Animated.View
        style={[styles.taglineWrap, { opacity: textOpacity }]}
      >
        <HudText variant="bodyLg" style={styles.tagline}>
          Intelligent Safety Systems
        </HudText>
        <HudText variant="mono" style={styles.subtitle}>
          Government of India · IIT Madras
        </HudText>
      </Animated.View>

      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>

      <Animated.View
        style={[
          styles.ctaWrap,
          { opacity: btnOpacity },
        ]}
        pointerEvents={ready ? 'auto' : 'none'}
      >
        {ready ? (
          <>
            <NovaButton label="Get started" onPress={onStart} variant="secondary" large />
            <HudText variant="mono" style={styles.fineprint}>
              Operates fully offline · No data leaves your device without consent
            </HudText>
          </>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.primary,
    paddingHorizontal: 32,
    paddingVertical: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(174,199,246,0.08)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -160,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(254,107,0,0.05)',
  },
  watermark: {
    position: 'absolute',
    top: '32%',
    alignItems: 'center',
    opacity: 0.6,
  },
  center: { alignItems: 'center', gap: 18, marginTop: 60 },
  shieldTile: {
    width: 124,
    height: 124,
    borderRadius: tokens.radius.iconWrap,
    backgroundColor: tokens.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  wordmark: {
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: 4,
    textAlign: 'center',
  },
  divider: {
    width: 56,
    height: 2,
    backgroundColor: tokens.secondary,
    marginTop: 8,
  },
  taglineWrap: { alignItems: 'center', gap: 6, marginTop: -40 },
  tagline: {
    color: tokens.onPrimaryContainer,
    fontFamily: 'PublicSans_500Medium',
    textAlign: 'center',
  },
  subtitle: {
    color: tokens.onPrimaryContainer,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  dotsRow: { flexDirection: 'row', gap: 10, marginTop: -20 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.secondary,
  },
  ctaWrap: { width: '100%', maxWidth: 360, gap: 14, alignItems: 'center' },
  fineprint: {
    color: tokens.onPrimaryContainer,
    fontSize: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 20,
    textTransform: 'none',
  },
});
