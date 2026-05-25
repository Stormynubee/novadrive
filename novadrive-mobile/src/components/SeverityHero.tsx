import { StyleSheet, View } from 'react-native';
import type { TriageColor } from '../lib/types';
import { SeverityChip } from './SeverityChip';
import { HudText } from './HudText';
import { HudCard } from './HudCard';
import { tokens } from '../theme/tokens';

const PLAIN: Record<TriageColor, string> = {
  RED: 'Immediate — RED',
  YELLOW: 'Urgent — YELLOW',
  GREEN: 'Delayed — GREEN',
  BLACK: 'Expectant — notify 108',
};

export function SeverityHero({ triage }: { triage: TriageColor }) {
  return (
    <HudCard accent="primary">
      <View style={styles.row}>
        <SeverityChip triage={triage} />
        <HudText variant="headlineMd" style={styles.plain}>
          {PLAIN[triage]}
        </HudText>
      </View>
    </HudCard>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12 },
  plain: { marginTop: 4 },
});
