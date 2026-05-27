import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { HudText } from '../HudText';
import { SarthiMiniWindow } from './SarthiMiniWindow';
import { tokens } from '../../theme/tokens';

const TAB_BAR_OFFSET = 88;
const PEEK_TEXT = 'How can I help with road safety today?';
const PEEK_MS = 5000;

export function SarthiHomeWidget() {
  const insets = useSafeAreaInsets();
  const { a11y } = useApp();
  const [open, setOpen] = useState(false);
  const [peekVisible, setPeekVisible] = useState(false);
  const reduceMotion = a11y.reduceMotion;

  const ringScale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion || open) {
      ringScale.value = 1;
      return;
    }
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
  }, [reduceMotion, open, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: 0.35,
  }));

  useFocusEffect(
    useCallback(() => {
      if (open || reduceMotion) {
        setPeekVisible(false);
        return;
      }
      setPeekVisible(true);
      const t = setTimeout(() => setPeekVisible(false), PEEK_MS);
      return () => clearTimeout(t);
    }, [open, reduceMotion])
  );

  const bottom = insets.bottom + TAB_BAR_OFFSET;

  return (
    <>
      {peekVisible && !open ? (
        <View style={[styles.peek, { bottom: bottom + 56, right: tokens.spacing.sideMargin }]}>
          <HudText variant="bodySm" style={styles.peekText}>
            {PEEK_TEXT}
          </HudText>
          <View style={styles.peekTail} />
        </View>
      ) : null}

      {open ? (
        <SarthiMiniWindow open showQuickLinks onClose={() => setOpen(false)} />
      ) : (
        <View style={[styles.fabWrap, { bottom, right: tokens.spacing.sideMargin }]}>
          <Animated.View style={[styles.pulseRing, ringStyle]} pointerEvents="none" />
          <Pressable
            onPress={() => setOpen(true)}
            style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
            accessibilityRole="button"
            accessibilityLabel="Open Sarthi safety assistant"
          >
            <MaterialIcons name="security" size={28} color={tokens.onPrimary} />
            <View style={styles.dot}>
              <View style={styles.dotInner} />
            </View>
          </Pressable>
        </View>
      )}

    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute',
    width: 56,
    height: 56,
    zIndex: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: tokens.secondary,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.primary,
    borderWidth: 2,
    borderColor: tokens.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.elevation.sos,
  },
  fabPressed: { transform: [{ scale: 0.95 }] },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: tokens.secondary,
    borderWidth: 2,
    borderColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.onPrimary,
  },
  peek: {
    position: 'absolute',
    maxWidth: 260,
    zIndex: 40,
    backgroundColor: tokens.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: tokens.primaryContainer,
    ...tokens.elevation.floating,
  },
  peekText: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  peekTail: {
    position: 'absolute',
    bottom: -6,
    right: 24,
    width: 12,
    height: 12,
    backgroundColor: tokens.primary,
    transform: [{ rotate: '45deg' }],
  },
});
