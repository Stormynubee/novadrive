import { router } from 'expo-router';
import { Switch, StyleSheet, Text, View } from 'react-native';
import { NovaButton } from '../src/components/NovaButton';
import { ScreenShell } from '../src/components/ScreenShell';
import { useApp } from '../src/context/AppContext';
import { setOnboarded } from '../src/lib/storage';
import { colors } from '../src/theme/colors';

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.amber }} />
    </View>
  );
}

export default function AccessibilityScreen() {
  const { a11y, updateA11y } = useApp();

  const finish = async () => {
    await setOnboarded();
    router.replace('/home');
  };

  return (
    <ScreenShell title="Accessibility" subtitle="Calm UI with text labels on every severity state.">
      <ToggleRow label="Larger text" value={a11y.largeText} onValueChange={(v) => updateA11y({ largeText: v })} />
      <ToggleRow label="High contrast" value={a11y.highContrast} onValueChange={(v) => updateA11y({ highContrast: v })} />
      <ToggleRow label="Reduce motion" value={a11y.reduceMotion} onValueChange={(v) => updateA11y({ reduceMotion: v })} />
      <ToggleRow label="TTS narrator (P1 stub)" value={a11y.ttsEnabled} onValueChange={(v) => updateA11y({ ttsEnabled: v })} />
      <NovaButton label="Enter NovaDrive" onPress={finish} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  label: { color: colors.text, fontSize: 16 },
});
