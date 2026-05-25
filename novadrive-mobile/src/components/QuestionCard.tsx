import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { HudText } from './HudText';
import { HudCard } from './HudCard';
import { tokens } from '../theme/tokens';

export function QuestionCard({
  prompt,
  promptHi,
  children,
}: {
  prompt: string;
  promptHi?: string;
  children: ReactNode;
}) {
  return (
    <HudCard accent="primary" variant="hero">
      <HudText variant="headlineMd" style={styles.prompt}>
        {prompt}
      </HudText>
      {promptHi ? (
        <HudText variant="bodySm" style={styles.hi}>
          {promptHi}
        </HudText>
      ) : null}
      <View style={styles.answers}>{children}</View>
    </HudCard>
  );
}

const styles = StyleSheet.create({
  prompt: { marginBottom: 8, color: tokens.primary },
  hi: { marginBottom: 16, color: tokens.onSurfaceVariant },
  answers: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
