import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { NovaButton } from '../../src/components/NovaButton';
import { ProgressRail } from '../../src/components/ProgressRail';
import { SeverityChip } from '../../src/components/SeverityChip';
import { ScreenShell } from '../../src/components/ScreenShell';
import { getQuestion, useApp } from '../../src/context/AppContext';
import { colors } from '../../src/theme/colors';

export default function TriageScreen() {
  const {
    triageState,
    triageResult,
    answerTriage,
    parseChat,
    chatPrefill,
    skipTriageStep,
  } = useApp();
  const [chat, setChat] = useState('');
  const q = getQuestion(triageState);

  const onSendChat = () => {
    const matched = parseChat(chat);
    if (matched.length === 0) {
      Alert.alert('No keywords matched', 'Try: "not breathing", "can\'t walk", "unconscious".');
      return;
    }
    Alert.alert('Understood', `We'll use this in triage: ${matched.join(', ')}`);
  };

  if (triageResult) {
    return (
      <ScreenShell title="Triage complete" subtitle="START FSM result — trauma-tier routing next.">
        <ProgressRail current="Triage" />
        <SeverityChip triage={triageResult} />
        <NovaButton label="Route to facility" onPress={() => router.push('/emergency/route')} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="START triage" subtitle="Deterministic medical spine. FSM makes all decisions.">
      <ProgressRail current="Triage" />
      <View style={styles.chatBox}>
        <Text style={styles.chatLabel}>Describe the emergency (offline parser)</Text>
        <TextInput
          style={styles.input}
          placeholder={'e.g. "not breathing, cannot walk"'}
          placeholderTextColor={colors.muted}
          value={chat}
          onChangeText={setChat}
          multiline
        />
        <NovaButton label="Send" onPress={onSendChat} variant="secondary" />
      </View>
      {chatPrefill && Object.keys(chatPrefill).length > 0 && (
        <NovaButton label="Apply parsed answers & skip step" onPress={skipTriageStep} variant="ghost" />
      )}
      {q && (
        <>
          <Text style={styles.prompt}>{q.prompt}</Text>
          {q.promptHi ? <Text style={styles.promptHi}>{q.promptHi}</Text> : null}
          {q.options.map((opt) => (
            <NovaButton
              key={opt.id}
              label={opt.label}
              onPress={() => answerTriage(opt.value)}
              variant="secondary"
            />
          ))}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chatBox: { gap: 8 },
  chatLabel: { color: colors.muted, fontSize: 13 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    minHeight: 72,
  },
  prompt: { color: colors.text, fontSize: 18, fontWeight: '600' },
  promptHi: { color: colors.muted, fontSize: 14 },
});
