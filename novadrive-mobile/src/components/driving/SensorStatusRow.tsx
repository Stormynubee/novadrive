import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

function SensorStatusCard({
  icon,
  title,
  subtitle,
  active,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  active: boolean;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <View style={sensorStyles.card}>
      <View style={sensorStyles.accent} />
      <View style={sensorStyles.iconWrap}>
        <MaterialIcons name={icon} size={20} color={tokens.primary} />
      </View>
      <View style={sensorStyles.text}>
        <HudText variant="bodyMd" style={sensorStyles.title}>
          {title}
        </HudText>
        <HudText variant="bodySm" style={sensorStyles.sub}>
          {subtitle}
        </HudText>
      </View>
      {active ? (
        <Animated.View style={[sensorStyles.dot, { opacity: dotOpacity }]} />
      ) : (
        <View style={[sensorStyles.dot, sensorStyles.dotOff]} />
      )}
    </View>
  );
}

export function SensorStatusRow({
  voiceMonitoring,
  motionLive,
}: {
  voiceMonitoring: boolean;
  motionLive: boolean;
}) {
  return (
    <View style={sensorStyles.list}>
      <SensorStatusCard
        icon={voiceMonitoring ? 'mic' : 'mic-off'}
        title="Voice Detection"
        subtitle={voiceMonitoring ? 'Active & Monitoring' : 'Standby'}
        active={voiceMonitoring}
      />
      <SensorStatusCard
        icon="sensors"
        title="Motion Sensors"
        subtitle={motionLive ? 'Calibrated' : 'Standby'}
        active={motionLive}
      />
    </View>
  );
}

const sensorStyles = StyleSheet.create({
  list: {
    paddingHorizontal: tokens.spacing.sideMargin,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(196,198,207,0.35)',
    padding: 12,
    gap: 12,
    overflow: 'hidden',
    ...tokens.elevation.card,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: tokens.primary,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  text: { flex: 1 },
  title: { color: tokens.onSurface, fontFamily: 'PublicSans_700Bold' },
  sub: { color: tokens.onSurfaceVariant, marginTop: 2 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.tertiaryFixedDim,
    shadowColor: tokens.tertiaryFixedDim,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  dotOff: {
    backgroundColor: tokens.outlineVariant,
    opacity: 0.5,
    shadowOpacity: 0,
  },
});
