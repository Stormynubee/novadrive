import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { NovaButton } from '../src/components/NovaButton';
import { ScreenShell } from '../src/components/ScreenShell';
import { useApp } from '../src/context/AppContext';
import { defaultMedical } from '../src/lib/storage';
import { colors } from '../src/theme/colors';

export default function MedicalScreen() {
  const { updateMedical } = useApp();
  const [m, setM] = useState(defaultMedical());

  const next = async () => {
    await updateMedical(m);
    router.push('/accessibility');
  };

  const field = (key: keyof typeof m, label: string) => (
    <TextInput
      key={key}
      style={styles.input}
      placeholder={label}
      placeholderTextColor={colors.muted}
      value={m[key] ?? ''}
      onChangeText={(t) => setM((prev) => ({ ...prev, [key]: t }))}
    />
  );

  return (
    <ScreenShell title="Medical profile" subtitle="Used for Golden Hour Packet when you consent. Never logged in plaintext.">
      {field('bloodType', 'Blood type (optional)')}
      {field('allergies', 'Allergies')}
      {field('conditions', 'Conditions')}
      {field('emergencyContact', 'Emergency contact')}
      <NovaButton label="Continue" onPress={next} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    minHeight: 48,
    marginBottom: 8,
  },
});
