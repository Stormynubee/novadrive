import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { HUD_SPEED_DIGIT_SIZE, HUD_SPEEDO_SIZE } from '../../lib/driving/hudLayoutSpec';
import { tokens } from '../../theme/tokens';

export function CompactSpeedometer({
  speed,
  speedLimitKmh,
  arcRatio,
  overSpeed,
}: {
  speed: number;
  speedLimitKmh: number;
  arcRatio: number;
  overSpeed: boolean;
}) {
  const rotateDeg = -135 + arcRatio * 270;
  const inner = HUD_SPEEDO_SIZE - 20;

  return (
    <View style={styles.section}>
      <View style={[styles.wrap, { width: HUD_SPEEDO_SIZE, height: HUD_SPEEDO_SIZE }]}>
        <View style={[styles.track, { borderRadius: HUD_SPEEDO_SIZE / 2 }]} />
        <View
          style={[
            styles.arc,
            {
              borderRadius: HUD_SPEEDO_SIZE / 2,
              transform: [{ rotate: `${rotateDeg}deg` }],
              borderTopColor: overSpeed ? tokens.error : tokens.secondary,
              borderRightColor: overSpeed ? tokens.error : tokens.secondary,
            },
          ]}
        />
        <View style={[styles.glass, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          <HudText variant="display" style={[styles.speed, { fontSize: HUD_SPEED_DIGIT_SIZE, lineHeight: HUD_SPEED_DIGIT_SIZE + 2 }]}>
            {speed}
          </HudText>
          <HudText variant="mono" style={styles.unit}>
            KM/H
          </HudText>
        </View>
      </View>
      <View style={[styles.limitBadge, overSpeed && styles.limitBadgeAlert]}>
        <MaterialIcons name="speed" size={18} color={tokens.onErrorContainer} />
        <HudText variant="bodySm" style={styles.limitText}>
          Zone Limit: {speedLimitKmh}
        </HudText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignItems: 'center', paddingHorizontal: 16 },
  wrap: { alignItems: 'center', justifyContent: 'center' },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 10,
    borderColor: tokens.surfaceContainerHigh,
    opacity: 0.5,
  },
  arc: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 10,
    borderColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  speed: {
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: -1,
  },
  unit: {
    color: tokens.outline,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
  },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: tokens.errorContainer,
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.2)',
  },
  limitBadgeAlert: { backgroundColor: tokens.errorContainer },
  limitText: {
    color: tokens.onErrorContainer,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.5,
  },
});
