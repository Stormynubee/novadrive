import { type Href, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { JourneyTicketFrame } from '../../src/components/JourneyTicketFrame';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { LiveChip } from '../../src/components/LiveChip';
import { MargiButton } from '../../src/components/MargiButton';
import { ScreenEnter } from '../../src/components/ScreenEnter';
import { StarRating } from '../../src/components/StarRating';
import {
  getJourneyLog,
  saveJourneyFeedback,
  saveJourneySummary,
  type FeedbackCategory,
  type JourneyLog,
  type JourneySummaryJson,
} from '../../src/lib/journeyDb';
import { tokens } from '../../src/theme/tokens';

const CATEGORIES: {
  key: FeedbackCategory;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { key: 'road', label: 'Road / corridor', icon: 'alt-route' },
  { key: 'app', label: 'App issue', icon: 'bug-report' },
  { key: 'safety', label: 'Safety alert', icon: 'shield' },
  { key: 'other', label: 'Other', icon: 'more-horiz' },
];

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 1) return `${s}s`;
  return `${m}m ${s}s`;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function SectionHeader({ title }: { title: string }) {
  return (
    <HudText variant="mono" style={sectionStyles.header}>
      {title}
    </HudText>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={statStyles.cell}>
      <HudText variant="mono" style={statStyles.label}>
        {label}
      </HudText>
      <HudText
        variant="headlineMd"
        style={[statStyles.value, accent ? { color: accent } : null]}
      >
        {value}
      </HudText>
    </View>
  );
}

/**
 * Stitch `nova_drive_safe_journey_summary_feedback` — manifest ticket + post-trip feedback in
 * one scrollable surface. Records pre/post category + 5-star rating + free-text comment.
 */
export default function JourneyCompleteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const [log, setLog] = useState<JourneyLog | null>(null);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>('road');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    getJourneyLog(String(id)).then(setLog);
  }, [id]);

  const submitFeedback = useCallback(async () => {
    if (rating < 1) {
      Alert.alert('Rating needed', 'Tap a star rating so the corridor data stays trustworthy.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Add a note', 'A short comment helps fellow drivers understand the corridor.');
      return;
    }
    setSubmitting(true);
    try {
      await saveJourneyFeedback({
        journeyId: id ? String(id) : null,
        phase: 'post_trip',
        rating,
        category,
        comment: comment.trim(),
      });
      if (id && log) {
        const summary: JourneySummaryJson = {
          stats: {
            durationSec: log.durationSec,
            maxSpeedKmh: log.maxSpeedKmh,
            impactAlerts: log.impactAlerts,
            voiceAlerts: log.voiceAlerts,
          },
          incidents: { impact: log.impactAlerts, voice: log.voiceAlerts },
          routeContext: log.destination,
          feedbackNote: comment.trim(),
        };
        await saveJourneySummary(String(id), summary);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      setSubmitted(true);
    } catch (e) {
      Alert.alert('Could not save', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [rating, category, comment, id, log]);

  const goHome = () => router.replace('/(tabs)/explore' as Href);
  const totalAlerts = log ? log.impactAlerts + log.voiceAlerts : 0;

  return (
    <ScreenEnter variant="fade">
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <HudText variant="mono" style={styles.kicker}>
              MISSION SUMMARY
            </HudText>
            <HudText variant="headlineLg" style={styles.title}>
              Journey complete
            </HudText>
          </View>
          <Pressable onPress={goHome} style={styles.closeBtn} accessibilityLabel="Close">
            <MaterialIcons name="close" size={24} color={tokens.primary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SectionHeader title="JOURNEY STATS" />
          <JourneyTicketFrame
            serial={id ? String(id).slice(0, 8).toUpperCase() : 'NO-ID'}
          >
            <View style={styles.summaryHead}>
              <View style={{ flex: 1 }}>
                <HudText variant="mono" style={styles.sectionTag}>
                  CORRIDOR
                </HudText>
                <HudText variant="headlineMd" style={styles.dest}>
                  {log?.destination ?? 'Loading manifest…'}
                </HudText>
                {log ? (
                  <HudText variant="bodySm" style={styles.when}>
                    {formatWhen(log.startedAt)}
                    {log.endedAt ? ` → ${formatWhen(log.endedAt)}` : ''}
                  </HudText>
                ) : null}
              </View>
              <LiveChip
                label={totalAlerts > 0 ? `${totalAlerts} flags` : 'Clean'}
                tone={totalAlerts > 0 ? 'warn' : 'safe'}
              />
            </View>

            {log ? (
              <View style={styles.statGrid}>
                <StatCell label="Duration" value={formatDuration(log.durationSec)} />
                <StatCell label="Peak speed" value={`${Math.round(log.maxSpeedKmh)} km/h`} />
                <StatCell
                  label="Impact flags"
                  value={String(log.impactAlerts)}
                  accent={log.impactAlerts > 0 ? tokens.secondary : tokens.tertiary}
                />
                <StatCell
                  label="Voice flags"
                  value={String(log.voiceAlerts)}
                  accent={log.voiceAlerts > 0 ? tokens.secondary : tokens.tertiary}
                />
              </View>
            ) : null}

            <View style={styles.divider} />

            <SectionHeader title="INCIDENTS" />
            {log ? (
              <View style={styles.incidentRow}>
                <MaterialIcons
                  name={log.impactAlerts > 0 ? 'warning' : 'check-circle'}
                  size={20}
                  color={log.impactAlerts > 0 ? tokens.secondary : tokens.tertiary}
                />
                <HudText variant="bodySm" style={styles.hint}>
                  Impact flags: {log.impactAlerts} · Voice flags: {log.voiceAlerts}
                </HudText>
              </View>
            ) : null}

            <SectionHeader title="ROUTE CONTEXT" />
            <HudText variant="bodyMd" style={styles.routeBody}>
              {log?.destination ?? 'Corridor manifest loading…'}
            </HudText>

            <View style={styles.divider} />

            <SectionHeader title="FEEDBACK" />
            <HudText variant="bodySm" style={styles.hint}>
              Archived locally — improves offline corridor intelligence.
            </HudText>
            {!submitted ? (
              <>
                <StarRating value={rating} onChange={setRating} />
                <View style={styles.chips}>
                  {CATEGORIES.map((c) => {
                    const active = category === c.key;
                    return (
                      <Pressable
                        key={c.key}
                        onPress={() => setCategory(c.key)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <MaterialIcons
                          name={c.icon}
                          size={16}
                          color={active ? tokens.onPrimary : tokens.primary}
                        />
                        <HudText
                          variant="mono"
                          style={[styles.chipText, active && styles.chipTextActive]}
                        >
                          {c.label}
                        </HudText>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="What went well? Any hazards or app issues to share?"
                  placeholderTextColor={tokens.outline}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  maxLength={500}
                />
                <MargiButton
                  label={submitting ? 'Saving…' : 'Submit feedback'}
                  onPress={submitFeedback}
                  large
                  disabled={submitting}
                />
              </>
            ) : (
              <View style={styles.thanks}>
                <View style={styles.thanksIcon}>
                  <MaterialIcons name="check-circle" size={36} color={tokens.tertiary} />
                </View>
                <HudText variant="headlineMd" style={styles.thanksTitle}>
                  Thank you — logged for the corridor
                </HudText>
                <HudText variant="bodySm" style={styles.hint}>
                  Return to Home to plan your next corridor or review trip history.
                </HudText>
              </View>
            )}
          </JourneyTicketFrame>

          <MargiButton label="Back to home" onPress={goHome} variant="ghost" />
        </ScrollView>
      </View>
    </ScreenEnter>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  kicker: { fontSize: 10, letterSpacing: 1.6, color: tokens.secondary },
  title: { color: tokens.primary, marginTop: 4 },
  closeBtn: { padding: 8 },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 48, gap: 18 },
  summaryHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sectionTag: { fontSize: 10, letterSpacing: 1.5, color: tokens.secondary },
  dest: { color: tokens.primary, marginTop: 4 },
  when: { color: tokens.onSurfaceVariant, marginTop: 4 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  divider: { height: 1, backgroundColor: tokens.outlineVariant, marginVertical: 8 },
  hint: { color: tokens.onSurfaceVariant, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
  },
  chipActive: { backgroundColor: tokens.primary, borderColor: tokens.primary },
  chipText: { fontSize: 11, letterSpacing: 0.6, color: tokens.primary },
  chipTextActive: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  input: {
    minHeight: 110,
    borderRadius: tokens.radius.input,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
    color: tokens.onSurface,
    padding: 14,
    textAlignVertical: 'top',
    fontFamily: 'PublicSans_400Regular',
    fontSize: 15,
  },
  thanks: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  thanksIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thanksTitle: { color: tokens.primary, textAlign: 'center' },
  incidentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  routeBody: { color: tokens.onSurface, lineHeight: 22, marginBottom: 8 },
});

const sectionStyles = StyleSheet.create({
  header: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: tokens.secondary,
    marginTop: 4,
    marginBottom: 8,
  },
});

const statStyles = StyleSheet.create({
  cell: {
    width: '47%',
    backgroundColor: tokens.surfaceContainerLow,
    borderRadius: tokens.radius.card,
    padding: 12,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  label: { fontSize: 9, letterSpacing: 1, color: tokens.onSurfaceVariant },
  value: { color: tokens.primary, marginTop: 6, fontSize: 18, lineHeight: 22 },
});
