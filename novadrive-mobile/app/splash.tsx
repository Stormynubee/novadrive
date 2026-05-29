import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { MargiButton } from '../src/components/MargiButton';
import { MargiLogo } from '../src/components/MargiLogo';
import { HudText } from '../src/components/HudText';
import { APP_TAGLINE, TEAM_DISPLAY_NAME } from '../src/lib/brand';
import { useApp } from '../src/context/AppContext';
import { tokens } from '../src/theme/tokens';

export default function SplashScreen() {
  const { a11y } = useApp();
  const [ready, setReady] = useState(a11y.reduceMotion);
  const logoOpacity = useRef(new Animated.Value(a11y.reduceMotion ? 1 : 0)).current;
  const logoScale = useRef(new Animated.Value(a11y.reduceMotion ? 1 : 0.88)).current;
  const textOpacity = useRef(new Animated.Value(a11y.reduceMotion ? 1 : 0)).current;
  const btnOpacity = useRef(new Animated.Value(a11y.reduceMotion ? 1 : 0)).current;
  const pulse = useRef(new Animated.Value(0.35)).current;

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

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0.35,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [a11y.reduceMotion, logoOpacity, logoScale, textOpacity, btnOpacity, pulse]);

  const onStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push('/auth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.glow} />

      <Animated.View
        style={[styles.center, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <MargiLogo size={100} showWordmark showTagline={false} tone="onLight" />
      </Animated.View>

      <Animated.View style={[styles.taglineWrap, { opacity: textOpacity }]}>
        <HudText variant="bodyLg" style={styles.tagline}>
          {APP_TAGLINE}
        </HudText>
        <HudText variant="mono" style={styles.subtitle}>
          IIT Madras RoadSoS · {TEAM_DISPLAY_NAME}
        </HudText>
      </Animated.View>

      <Animated.View style={[styles.pulseBar, { opacity: pulse }]} />

      <Animated.View style={[styles.ctaWrap, { opacity: btnOpacity }]} pointerEvents={ready ? 'auto' : 'none'}>
        {ready ? (
          <>
            <MargiButton label="Get started" onPress={onStart} variant="secondary" large />
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
    backgroundColor: tokens.surface,
    paddingHorizontal: 32,
    paddingVertical: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glow: {
    position: 'absolute',
    top: '20%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0,86,179,0.06)',
  },
  center: { alignItems: 'center', marginTop: 48 },
  taglineWrap: { alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  tagline: {
    color: tokens.onSurfaceVariant,
    fontFamily: 'PublicSans_500Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitle: {
    color: tokens.outline,
    fontSize: 11,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  pulseBar: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: tokens.secondary,
    marginVertical: 8,
  },
  ctaWrap: { width: '100%', maxWidth: 360, gap: 14, alignItems: 'center' },
  fineprint: {
    color: tokens.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 0.4,
    textAlign: 'center',
    paddingHorizontal: 20,
    textTransform: 'none',
  },
});
