import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { NovaButton } from '../../src/components/NovaButton';
import { NovaTopBar } from '../../src/components/NovaTopBar';
import { ScreenEnter } from '../../src/components/ScreenEnter';
import { StarRating } from '../../src/components/StarRating';
import {
  saveJourneyFeedback,
  type FeedbackCategory,
} from '../../src/lib/journeyDb';
import { tokens } from '../../src/theme/tokens';

const CATEGORIES: { key: FeedbackCategory; label: string }[] = [
  { key: 'road', label: 'Road / corridor' },
  { key: 'app', label: 'App issue' },
  { key: 'safety', label: 'Safety concern' },
  { key: 'other', label: 'Other' },
];

/**
 * Pre-trip pulse — log a hazard or app concern before starting the drive. Mirrors the lighter
 * feedback compose surface in `community_feedback_hub`.
 */
export default function PreTripFeedbackScreen() {
  const { hazard } = useLocalSearchParams<{ hazard?: string }>();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>(
    hazard === '1' ? 'safety' : 'road'
  );
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (rating < 1 || !comment.trim()) {
      Alert.alert('Almost there', 'Add a star rating and a short note before saving.');
      return;
    }
    setBusy(true);
    try {
      await saveJourneyFeedback({
        journeyId: null,
        phase: 'pre_trip',
        rating,
        category,
        comment: comment.trim(),
      });
      router.back();
    } catch (e) {
      Alert.alert('Save failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenEnter variant="slide">
      <View style={styles.root}>
        <NovaTopBar
          title="PRE-TRIP PULSE"
          subtitle="Quick corridor note"
          showBack
        />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
        >
          <HudText variant="mono" style={styles.kicker}>
            ROUTE FEEDBACK
          </HudText>
          <HudText variant="headlineLg" style={styles.title}>
            Anything to flag?
          </HudText>
          <HudText variant="bodyMd" style={styles.body}>
            Spotted a hazard or app issue before you roll? Log it now — the corridor database
            updates locally and is shared anonymously when you connect.
          </HudText>

          <HudCard accent="primary">
            <HudText variant="mono" style={styles.label}>
              Severity rating
            </HudText>
            <StarRating value={rating} onChange={setRating} />
          </HudCard>

          <HudCard>
            <HudText variant="mono" style={styles.label}>
              Category
            </HudText>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => {
                const active = category === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCategory(c.key)}
                    style={[styles.chip, active && styles.chipOn]}
                  >
                    <HudText
                      variant="mono"
                      style={active ? styles.chipOnText : styles.chipText}
                    >
                      {c.label}
                    </HudText>
                  </Pressable>
                );
              })}
            </View>
          </HudCard>

          <HudCard>
            <HudText variant="mono" style={styles.label}>
              Note
            </HudText>
            <TextInput
              style={styles.input}
              placeholder="e.g. NH48 flooding near km 42 — offline pack gap"
              placeholderTextColor={tokens.outline}
              value={comment}
              onChangeText={setComment}
              multiline
            />
          </HudCard>

          <NovaButton
            label={busy ? 'Saving…' : 'Save note'}
            onPress={submit}
            large
            disabled={busy}
          />
          <NovaButton label="Cancel" onPress={() => router.back()} variant="ghost" />
        </ScrollView>
      </View>
    </ScreenEnter>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, paddingTop: 16, gap: 14 },
  kicker: { fontSize: 10, letterSpacing: 1.6, color: tokens.secondary },
  title: { color: tokens.primary, marginTop: 4 },
  body: { color: tokens.onSurfaceVariant, lineHeight: 22, marginBottom: 6 },
  label: { color: tokens.primary, fontSize: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
  },
  chipOn: { backgroundColor: tokens.primary, borderColor: tokens.primary },
  chipText: { fontSize: 11, color: tokens.primary, letterSpacing: 0.4 },
  chipOnText: {
    fontSize: 11,
    color: tokens.onPrimary,
    letterSpacing: 0.4,
    fontFamily: 'PublicSans_700Bold',
  },
  input: {
    minHeight: 100,
    borderRadius: tokens.radius.input,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    color: tokens.onSurface,
    backgroundColor: tokens.surface,
    padding: 14,
    textAlignVertical: 'top',
    fontFamily: 'PublicSans_400Regular',
    fontSize: 15,
  },
});
