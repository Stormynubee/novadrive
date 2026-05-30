import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { useTorch } from '../../hooks/useTorch';
import {
  buildIncidentElapsedDisplay,
  type IncidentElapsedDisplay,
} from '../../lib/emergency/incidentElapsed';
import { tokens } from '../../theme/tokens';

type Props = {
  activatedAt?: string;
  incidentLabel?: string;
};

function severityColors(severity: IncidentElapsedDisplay['severity']) {
  if (severity === 'critical') {
    return {
      stripe: tokens.error,
      dot: tokens.error,
      clock: tokens.error,
    };
  }
  if (severity === 'urgent') {
    return {
      stripe: tokens.secondary,
      dot: tokens.secondary,
      clock: tokens.secondaryDeep,
    };
  }
  return {
    stripe: tokens.tertiary,
    dot: tokens.tertiary,
    clock: tokens.primary,
  };
}

export function TraumaResponseActionBar({ activatedAt, incidentLabel }: Props) {
  const { torchOn, toggleTorch, turnOffTorch, TorchLayer } = useTorch();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => turnOffTorch(), [turnOffTorch]);

  const elapsed = useMemo(() => {
    if (!activatedAt) {
      return {
        clock: '--:--',
        caption: 'AWAITING TIMESTAMP',
        severity: 'normal' as const,
      };
    }
    return buildIncidentElapsedDisplay(activatedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick drives refresh
  }, [activatedAt, tick]);

  const colors = severityColors(elapsed.severity);

  return (
    <View style={styles.wrap}>
      {TorchLayer}
      <Pressable
        style={({ pressed }) => [styles.statusCard, pressed && styles.pressed]}
        accessibilityRole="text"
        accessibilityLabel={`Incident active ${elapsed.clock} ${elapsed.caption}`}
      >
        <View style={[styles.stripe, { backgroundColor: colors.stripe }]} />
        <View style={styles.cardBody}>
          <View style={styles.statusHead}>
            <View style={[styles.liveDot, { backgroundColor: colors.dot }]} />
            <HudText variant="mono" style={styles.statusLabel}>
              INCIDENT ACTIVE
            </HudText>
          </View>
          <HudText variant="display" style={[styles.clock, { color: colors.clock }]}>
            {elapsed.clock}
          </HudText>
          <HudText variant="bodySm" style={styles.caption}>
            {elapsed.caption}
            {incidentLabel ? ` · ${incidentLabel}` : ''}
          </HudText>
        </View>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.torchCard,
          torchOn && styles.torchCardOn,
          pressed && styles.pressed,
        ]}
        onPress={() => void toggleTorch()}
        accessibilityRole="button"
        accessibilityLabel={torchOn ? 'Turn torch off' : 'Turn torch on'}
        accessibilityState={{ selected: torchOn }}
      >
        <View style={[styles.torchIconWrap, torchOn && styles.torchIconWrapOn]}>
          <MaterialIcons
            name={torchOn ? 'flashlight-on' : 'flashlight-off'}
            size={28}
            color={torchOn ? tokens.onSecondary : tokens.primary}
          />
        </View>
        <HudText variant="mono" style={[styles.torchLabel, torchOn && styles.torchLabelOn]}>
          TORCH
        </HudText>
        <HudText variant="bodySm" style={[styles.torchState, torchOn && styles.torchStateOn]}>
          {torchOn ? 'ON · REAR FLASH' : 'TAP TO LIGHT'}
        </HudText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  statusCard: {
    flex: 1.35,
    flexDirection: 'row',
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    overflow: 'hidden',
    minHeight: 96,
    ...tokens.elevation.card,
  },
  stripe: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 2,
  },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    color: tokens.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 1.1,
    fontFamily: 'PublicSans_700Bold',
  },
  clock: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 1,
  },
  caption: {
    color: tokens.onSurfaceVariant,
    fontFamily: 'PublicSans_600SemiBold',
    letterSpacing: 0.3,
  },
  torchCard: {
    flex: 1,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
    minHeight: 96,
    ...tokens.elevation.card,
  },
  torchCardOn: {
    backgroundColor: tokens.secondary,
    borderColor: tokens.secondaryDeep,
    ...tokens.elevation.sos,
  },
  torchIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchIconWrapOn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  torchLabel: {
    color: tokens.primary,
    fontSize: 11,
    letterSpacing: 1.2,
    fontFamily: 'PublicSans_700Bold',
  },
  torchLabelOn: {
    color: tokens.onSecondary,
  },
  torchState: {
    color: tokens.onSurfaceVariant,
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'PublicSans_600SemiBold',
  },
  torchStateOn: {
    color: 'rgba(255,255,255,0.9)',
  },
});
