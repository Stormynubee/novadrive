import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

const PRESETS = [
  'Help needed at my location',
  'Suspected vehicle follow',
  'Medical emergency',
] as const;

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
};

export function NaariQuickMessage({ value, onChange, onSend }: Props) {
  return (
    <View style={styles.wrap}>
      <HudText variant="mono" style={styles.label}>
        QUICK HELP MESSAGE
      </HudText>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="Type or select a preset..."
          placeholderTextColor={tokens.outline}
          multiline
        />
        <Pressable onPress={onSend} style={styles.send} accessibilityLabel="Send message">
          <MaterialIcons name="send" size={22} color={tokens.primary} />
        </Pressable>
      </View>
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Pressable key={p} style={styles.preset} onPress={() => onChange(p)}>
            <HudText variant="bodySm" style={styles.presetText}>
              {p}
            </HudText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surfaceContainerLowest,
    marginTop: 16,
  },
  label: { color: tokens.primary, marginBottom: 8, fontFamily: 'PublicSans_700Bold' },
  inputRow: { position: 'relative' },
  input: {
    borderWidth: 1,
    borderColor: `${tokens.primary}33`,
    borderRadius: tokens.radius.input,
    padding: 12,
    paddingRight: 44,
    minHeight: 72,
    fontFamily: 'PublicSans_400Regular',
    fontSize: 16,
    color: tokens.onSurface,
  },
  send: { position: 'absolute', right: 8, bottom: 8, padding: 4 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surfaceContainer,
  },
  presetText: { fontFamily: 'PublicSans_700Bold', color: tokens.onSurface },
});
