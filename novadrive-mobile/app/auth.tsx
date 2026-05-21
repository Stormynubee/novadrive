import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NovaButton } from '../src/components/NovaButton';
import { ScreenShell } from '../src/components/ScreenShell';
import { useApp } from '../src/context/AppContext';
import { colors } from '../src/theme/colors';

export default function AuthScreen() {
  const { updateProfile } = useApp();
  const [email, setEmail] = useState('');

  const continueGuest = async () => {
    await updateProfile({ mode: 'guest', name: 'Guest' });
    router.push('/medical');
  };

  const continueAuth = async () => {
    await updateProfile({ mode: 'auth', name: email || 'User' });
    router.push('/medical');
  };

  return (
    <ScreenShell title="Welcome" subtitle="Sign in with Supabase later — use Guest for judges demo.">
      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <NovaButton label="Continue as Guest" onPress={continueGuest} />
      <NovaButton label="Continue" onPress={continueAuth} variant="secondary" />
      <Text style={styles.note}>No passwords stored on device. Medical data stays local in guest mode.</Text>
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
  },
  note: { color: colors.muted, fontSize: 13, lineHeight: 20 },
});
