import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HudText } from '../HudText';
import { useApp } from '../../context/AppContext';
import { tokens } from '../../theme/tokens';

/**
 * Stitch home dashboard — saffron NAARI SHAKTI portal card with pulse-rotate female icon.
 * Shown only for eligible (female) users on the home tab.
 */
export function NaariShaktiPortalButton({ onPress }: { onPress: () => void }) {
  const { a11y } = useApp();
  const reduceMotion = a11y.reduceMotion;

  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [reduceMotion, scale, rotate]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.outer, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Naari Shakti Safety Portal"
    >
      <View style={styles.gradientFill} />
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Animated.View style={iconStyle}>
            <MaterialIcons name="female" size={32} color={tokens.onSecondary} />
          </Animated.View>
        </View>
        <View style={styles.labels}>
          <HudText variant="headlineMd" style={styles.title}>
            NAARI SHAKTI
          </HudText>
          <HudText variant="bodySm" style={styles.sub}>
            SAFETY PORTAL
          </HudText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.secondaryContainer,
    opacity: 0.95,
  },
  outer: {
    height: 124,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 200, 150, 0.35)',
    overflow: 'hidden',
    backgroundColor: tokens.secondary,
    shadowColor: tokens.secondaryContainer,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.96 },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: { alignItems: 'flex-start' },
  title: {
    color: tokens.onSecondary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: 2,
    fontSize: 20,
  },
  sub: {
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
    marginTop: 2,
    textTransform: 'uppercase',
    fontSize: 12,
    fontFamily: 'PublicSans_600SemiBold',
  },
});
