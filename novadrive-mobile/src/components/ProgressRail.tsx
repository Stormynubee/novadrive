import { StyleSheet, View } from 'react-native';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

const STEPS = ['Locate', 'Triage', 'Route', 'Packet', 'Relay'] as const;
export type RailStep = (typeof STEPS)[number];

/**
 * Five-step emergency stepper used at the top of the Locate→Relay flow. Filled saffron for
 * completed/current; muted outline for upcoming. Mirrors the stepped pip rail in
 * `nova_drive_phase_1_locate_header_standardized`.
 */
export function ProgressRail({ current }: { current: RailStep }) {
  const idx = STEPS.indexOf(current);
  return (
    <View style={styles.row}>
      {STEPS.map((label, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <View key={label} style={styles.item}>
            <View style={styles.dotRow}>
              {i > 0 ? (
                <View style={[styles.line, i <= idx && styles.lineActive]} />
              ) : null}
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  active && styles.dotActive,
                ]}
              >
                {done ? null : (
                  <HudText variant="mono" style={[styles.dotIdx, active && styles.dotIdxActive]}>
                    {i + 1}
                  </HudText>
                )}
              </View>
            </View>
            <HudText
              variant="mono"
              style={[
                styles.text,
                (done || active) && styles.textActive,
              ]}
            >
              {label}
            </HudText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  item: { alignItems: 'center', flex: 1 },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    marginBottom: 6,
    width: '100%',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: tokens.outlineVariant,
    marginRight: 4,
  },
  lineActive: { backgroundColor: tokens.secondary },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: tokens.surface,
    borderWidth: 1.5,
    borderColor: tokens.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: tokens.secondary, borderColor: tokens.secondary },
  dotActive: {
    borderColor: tokens.secondary,
    borderWidth: 2,
    backgroundColor: tokens.surface,
  },
  dotIdx: { fontSize: 9, color: tokens.onSurfaceVariant, letterSpacing: 0 },
  dotIdxActive: { color: tokens.secondary, fontFamily: 'PublicSans_700Bold' },
  text: {
    fontSize: 9,
    color: tokens.onSurfaceVariant,
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  textActive: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
});
