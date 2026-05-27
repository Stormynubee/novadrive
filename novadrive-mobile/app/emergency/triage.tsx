import { type Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { speakA11y } from '../../src/lib/a11yRuntime';
import { AnswerChips } from '../../src/components/AnswerChips';
import { CollapsibleChat } from '../../src/components/CollapsibleChat';
import { EmergencyStepShell } from '../../src/components/EmergencyStepShell';
import { NovaButton } from '../../src/components/NovaButton';
import { QuestionCard } from '../../src/components/QuestionCard';
import { SeverityHero } from '../../src/components/SeverityHero';
import { getQuestion, useApp } from '../../src/context/AppContext';
import {
  EMERGENCY_SELECTION_PATH,
  shouldGateTriageWithoutIncident,
} from '../../src/lib/emergency/emergencyNavigation';

export default function TriageScreen() {
  const {
    a11y,
    session,
    triageState,
    triageResult,
    answerTriage,
    applyChatToTriage,
    chatPrefill,
    skipTriageStep,
  } = useApp();
  const [chat, setChat] = useState('');
  const [applied, setApplied] = useState<string[]>([]);
  const q = getQuestion(triageState);

  useFocusEffect(
    useCallback(() => {
      if (shouldGateTriageWithoutIncident(session.incidentType)) {
        router.replace(EMERGENCY_SELECTION_PATH as Href);
      }
    }, [session.incidentType])
  );

  useEffect(() => {
    if (q?.prompt) speakA11y(q.prompt, a11y);
  }, [q?.prompt, a11y]);

  const onSendChat = () => {
    const trimmed = chat.trim();
    if (!trimmed) return;
    const matched = applyChatToTriage(trimmed);
    if (matched.length === 0) {
      Alert.alert('No keywords matched', 'Try: "not breathing", "can\'t walk", "unconscious".');
      return;
    }
    setApplied(matched);
    setChat('');
  };

  if (triageResult) {
    return (
      <EmergencyStepShell
        step="Triage"
        title="Triage complete"
        subtitle="Trauma tier set — route to the nearest matching facility."
        showBack
        footer={
          <NovaButton label="Route to facility" onPress={() => router.push('/emergency/route')} large />
        }
      >
        <SeverityHero triage={triageResult} />
      </EmergencyStepShell>
    );
  }

  const footer =
    chatPrefill && Object.keys(chatPrefill).length > 0 ? (
      <NovaButton label="Apply all parsed answers" onPress={skipTriageStep} variant="ghost" />
    ) : undefined;

  return (
    <EmergencyStepShell
      step="Triage"
      title="Triage"
      subtitle="Answer a few questions — the app decides the trauma tier."
      showBack
      footer={footer}
    >
      {q ? (
        <QuestionCard prompt={q.prompt} promptHi={q.promptHi}>
          <AnswerChips options={q.options} onSelect={(v) => answerTriage(v)} />
        </QuestionCard>
      ) : null}
      <CollapsibleChat value={chat} onChangeText={setChat} onSend={onSendChat} appliedTags={applied} />
    </EmergencyStepShell>
  );
}
