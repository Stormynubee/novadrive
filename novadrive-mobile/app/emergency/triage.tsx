import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { AnswerChips } from '../../src/components/AnswerChips';
import { EmergencyStepShell } from '../../src/components/EmergencyStepShell';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { useApp, getQuestion } from '../../src/context/AppContext';
import {
  EMERGENCY_ACTIVATION_PATH,
  EMERGENCY_RESPONSE_PATH,
  shouldGateTriageWithoutIncident,
} from '../../src/lib/emergency/emergencyNavigation';
import { speakFsmPrompt } from '../../src/lib/tts/narrator';
import { tokens } from '../../src/theme/tokens';

/**
 * START triage FSM — spoken prompts when accessibility TTS is enabled.
 */
export default function TriageScreen() {
  const {
    session,
    triageState,
    triageResult,
    answerTriage,
    a11y,
    settings,
  } = useApp();

  const question = getQuestion(triageState);

  useEffect(() => {
    if (shouldGateTriageWithoutIncident(session.incidentType)) {
      router.replace(EMERGENCY_ACTIVATION_PATH as Href);
      return;
    }
    if (triageResult) {
      router.replace(EMERGENCY_RESPONSE_PATH as Href);
      return;
    }
  }, [session.incidentType, triageResult]);

  useEffect(() => {
    if (!question || triageResult) return;
    speakFsmPrompt(triageState, settings.language, { ttsEnabled: a11y.ttsEnabled });
  }, [triageState, question, a11y.ttsEnabled, settings.language, triageResult]);

  if (shouldGateTriageWithoutIncident(session.incidentType) || triageResult) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.background }} />
    );
  }

  if (!question) {
    return (
      <EmergencyStepShell
        step="Triage"
        title="Triage complete"
        subtitle="Routing to trauma response."
        showBack
        footer={
          <MargiButton
            label="Continue"
            large
            onPress={() => router.replace(EMERGENCY_RESPONSE_PATH as Href)}
          />
        }
      >
        <HudCard accent="tertiary">
          <HudText variant="bodyMd">Assessment recorded. Proceed to response.</HudText>
        </HudCard>
      </EmergencyStepShell>
    );
  }

  return (
    <EmergencyStepShell
      step="Triage"
      title="START assessment"
      subtitle="Answer each question for triage color tagging."
      showBack
    >
      <HudCard accent="primary">
        <HudText variant="headlineMd" style={{ color: tokens.primary, marginBottom: 8 }}>
          {question.prompt}
        </HudText>
        {a11y.ttsEnabled ? (
          <HudText variant="mono" style={{ color: tokens.secondary, marginBottom: 12 }}>
            TTS narrator on
          </HudText>
        ) : null}
        <AnswerChips
          options={question.options}
          onSelect={(value) => answerTriage(value)}
        />
      </HudCard>
    </EmergencyStepShell>
  );
}
