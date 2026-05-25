import { ScrollView, StyleSheet } from 'react-native';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

export function DispatchPanel({ text }: { text: string }) {
  return (
    <ScrollView style={styles.panel} nestedScrollEnabled>
      <HudText variant="monoData" style={styles.text}>
        {text}
      </HudText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  panel: {
    maxHeight: 220,
    backgroundColor: tokens.surfaceContainerLow,
    borderRadius: tokens.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  text: { fontSize: 13, lineHeight: 20, color: tokens.primary },
});
