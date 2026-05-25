import { StyleSheet, View } from 'react-native';
import { HudText } from '../HudText';
import type { SarthiMessage } from '../../lib/sarthiTypes';
import { tokens } from '../../theme/tokens';
import { SarthiActionCard } from './SarthiActionCard';

export function SarthiMessageBubble({ message }: { message: SarthiMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.user : styles.assistant]}>
        <HudText variant="bodyMd" style={isUser ? styles.userText : styles.assistantText}>
          {message.text}
        </HudText>
      </View>
      {message.actionCard ? <SarthiActionCard card={message.actionCard} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignSelf: 'flex-start', maxWidth: '88%', marginBottom: tokens.spacing.stackSm },
  rowUser: { alignSelf: 'flex-end' },
  bubble: {
    borderRadius: tokens.radius.card,
    paddingHorizontal: tokens.spacing.gutter,
    paddingVertical: tokens.spacing.base,
  },
  assistant: {
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    ...tokens.elevation.card,
  },
  user: { backgroundColor: tokens.primaryContainer },
  assistantText: { color: tokens.onSurface },
  userText: { color: tokens.onPrimary },
});
