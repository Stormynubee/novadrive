import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { tokens } from '../../theme/tokens';

export function SarthiComposer({
  value,
  onChangeText,
  onSend,
  onMicPress,
  disabled,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onMicPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Ask Sarthi about your corridor…"
        placeholderTextColor={tokens.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        onSubmitEditing={onSend}
        returnKeyType="send"
      />
      {onMicPress ? (
        <Pressable onPress={onMicPress} hitSlop={8} style={styles.iconBtn}>
          <MaterialIcons name="mic" size={22} color={tokens.primary} />
        </Pressable>
      ) : null}
      <Pressable
        onPress={onSend}
        disabled={disabled || !value.trim()}
        style={[styles.sendBtn, (!value.trim() || disabled) && styles.sendDisabled]}
      >
        <MaterialIcons name="send" size={20} color={tokens.onSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: tokens.spacing.gutter,
    paddingVertical: tokens.spacing.base,
    backgroundColor: tokens.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: tokens.radius.input,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    paddingHorizontal: 12,
    fontFamily: 'PublicSans_400Regular',
    fontSize: 15,
    color: tokens.onSurface,
    backgroundColor: tokens.surfaceContainerLow,
  },
  iconBtn: { padding: 6 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.45 },
});
