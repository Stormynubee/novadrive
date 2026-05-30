import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { type Href, router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { DashboardHeader } from '../../src/components/DashboardHeader';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { useHomeLocationWeather } from '../../src/hooks/useHomeLocationWeather';
import { filterAlertsWithinKm } from '../../src/lib/home/localSafetyAlerts';
import {
  OFFICIAL_REPORT_OPTIONS,
  SEED_ALERTS,
  SEED_PIONEERS,
  type AlertSeverity,
  type CommunityAlert,
} from '../../src/lib/communityAlerts';
import { listCommunityFeedback, saveJourneyFeedback, type JourneyFeedback } from '../../src/lib/journeyDb';
import { tokens } from '../../src/theme/tokens';

function severityAccent(sev: AlertSeverity) {
  if (sev === 'critical') return tokens.secondaryContainer;
  if (sev === 'warning') return tokens.primaryFixed;
  return tokens.outlineVariant;
}

function alertIcon(name: CommunityAlert['icon']) {
  if (name === 'flood') return 'flood' as const;
  if (name === 'construction') return 'construction' as const;
  return 'traffic' as const;
}

function feedbackToAlert(f: JourneyFeedback): CommunityAlert {
  const mins = Math.max(
    1,
    Math.round((Date.now() - new Date(f.createdAt).getTime()) / 60_000)
  );
  return {
    id: f.id,
    title: f.category === 'safety' ? 'Road hazard reported' : 'Community report',
    body: f.comment,
    ago: mins < 60 ? `${mins} mins ago` : `${Math.round(mins / 60)} hr ago`,
    severity: f.category === 'safety' ? 'critical' : f.rating <= 2 ? 'warning' : 'info',
    icon: f.category === 'safety' ? 'flood' : 'construction',
    verified: false,
  };
}

/**
 * Community tab — Stitch `community_feedback_hub`.
 */
export default function CommunityTabScreen() {
  const [feedback, setFeedback] = useState<JourneyFeedback[]>([]);
  const [reportCategory, setReportCategory] = useState(0);
  const [reportText, setReportText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { lat, lng, loading: locationLoading, permissionDenied, refresh: refreshLocation } =
    useHomeLocationWeather();

  useFocusEffect(
    useCallback(() => {
      void refreshLocation();
      listCommunityFeedback(40).then(setFeedback);
    }, [refreshLocation])
  );

  const alerts = useMemo(() => {
    const userAlerts = feedback
      .filter((f) => f.category === 'safety' || f.category === 'road')
      .map(feedbackToAlert);
    const geoAlerts = SEED_ALERTS.filter(
      (a): a is CommunityAlert & { lat: number; lng: number } =>
        a.lat != null && a.lng != null
    );
    if (lat == null || lng == null) {
      return userAlerts;
    }
    const nearbySeed = filterAlertsWithinKm(geoAlerts, lat, lng, 5);
    return [...userAlerts, ...nearbySeed];
  }, [feedback, lat, lng]);

  const submitOfficialReport = async () => {
    if (!reportText.trim()) {
      Alert.alert('Add details', 'Describe the observation so the corridor team can act on it.');
      return;
    }
    setSubmitting(true);
    try {
      const opt = OFFICIAL_REPORT_OPTIONS[reportCategory];
      await saveJourneyFeedback({
        journeyId: null,
        phase: 'pre_trip',
        rating: opt.rating,
        category: opt.category,
        comment: `[${opt.label}] ${reportText.trim()}`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      setReportText('');
      listCommunityFeedback(40).then(setFeedback);
      Alert.alert('Report submitted', 'Thank you — logged locally for the corridor intelligence pack.');
    } catch (e) {
      Alert.alert('Could not submit', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <DashboardHeader subtitle="Community vigilance" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <HudCard accent="primary" style={styles.hero}>
          <View style={styles.heroInner}>
            <View style={{ flex: 1 }}>
              <HudText variant="headlineMd" style={styles.heroTitle}>
                Community Vigilance
              </HudText>
              <HudText variant="bodyMd" style={styles.heroBody}>
                Real-time situational awareness. Report hazards to protect fellow citizens and assist
                local authorities in maintaining safe transit corridors.
              </HudText>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.reportBtn, pressed && { opacity: 0.92 }]}
            onPress={() => router.push('/journey/feedback?hazard=1' as Href)}
          >
            <MaterialIcons name="warning" size={20} color={tokens.onSecondary} />
            <HudText variant="mono" style={styles.reportBtnLabel}>
              REPORT ROAD HAZARD
            </HudText>
          </Pressable>
        </HudCard>

        {/* ── Local Safety Alerts header ── */}
        <View style={styles.sectionHead}>
          {/* Row 1: icon + title */}
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="campaign" size={20} color={tokens.secondary} />
            <HudText variant="headlineMd" style={styles.sectionTitle}>
              Local Safety Alerts
            </HudText>
          </View>
          {/* Row 2: geo-radius badge chip */}
          <View style={styles.geoBadge}>
            <View style={styles.geoDot} />
            <HudText variant="mono" style={styles.geoBadgeText}>
              Active within 5 km
            </HudText>
          </View>
        </View>

        {locationLoading ? (
          <View style={styles.statusRow}>
            <MaterialIcons name="my-location" size={14} color={tokens.secondary} />
            <HudText variant="bodySm" style={styles.statusText}>
              Locating alerts near you…
            </HudText>
          </View>
        ) : permissionDenied || lat == null ? (
          <View style={styles.statusRow}>
            <MaterialIcons name="location-off" size={14} color={tokens.onSurfaceVariant} />
            <HudText variant="bodySm" style={styles.statusText}>
              Enable location to see corridor alerts within 5 km.
            </HudText>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.statusRow}>
            <MaterialIcons name="check-circle-outline" size={14} color={tokens.primary} />
            <HudText variant="bodySm" style={styles.statusText}>
              No active alerts within 5 km — corridor is clear.
            </HudText>
          </View>
        ) : null}

        {alerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={[styles.alertStripe, { backgroundColor: severityAccent(alert.severity) }]} />
            <View style={styles.alertIconWrap}>
              <MaterialIcons
                name={alertIcon(alert.icon)}
                size={20}
                color={alert.severity === 'critical' ? tokens.error : tokens.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.alertHead}>
                <HudText variant="bodyMd" style={styles.alertTitle}>
                  {alert.title}
                </HudText>
                <HudText variant="bodySm" style={styles.alertAgo}>
                  {alert.ago}
                </HudText>
              </View>
              <HudText variant="bodySm" style={styles.alertBody}>
                {alert.body}
              </HudText>
              {alert.verified ? (
                <View style={styles.verifiedRow}>
                  <MaterialIcons name="verified" size={14} color={tokens.primary} />
                  <HudText variant="bodySm" style={styles.verifiedText}>
                    Official Authority Confirmed
                  </HudText>
                </View>
              ) : null}
            </View>
          </View>
        ))}

        <View style={[styles.sectionHead, { marginTop: 8 }]}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="local-police" size={20} color={tokens.primary} />
            <HudText variant="headlineMd" style={styles.sectionTitle}>
              Safety Pioneers
            </HudText>
          </View>
        </View>

        <HudCard style={styles.leaderCard}>
          <View style={styles.leaderBanner}>
            <HudText variant="mono" style={styles.leaderBadge}>
              District Top 3
            </HudText>
          </View>
          {SEED_PIONEERS.map((p, i) => (
            <View key={p.rank} style={[styles.leaderRow, i === 0 && styles.leaderRowTop]}>
              <View style={[styles.rankCircle, i === 0 && styles.rankCircleFirst]}>
                <HudText variant="bodyMd" style={i === 0 ? styles.rankFirstText : styles.rankText}>
                  {p.rank}
                </HudText>
              </View>
              <View style={{ flex: 1 }}>
                <HudText variant="bodyMd" style={styles.pioneerName}>
                  {p.name}
                </HudText>
                <HudText variant="bodySm" style={styles.pioneerScore}>
                  {p.score} Safety Score
                </HudText>
              </View>
              {p.verified ? (
                <MaterialIcons name="verified-user" size={22} color={tokens.secondary} />
              ) : null}
            </View>
          ))}
          <HudText variant="bodySm" style={styles.leaderFoot}>
            Scores calculated via Edge AI telemetry. Drive safe to climb the ranks.
          </HudText>
        </HudCard>

        <HudCard accent="primary" style={styles.formCard}>
          <HudText variant="headlineMd" style={styles.formTitle}>
            System Feedback & Design Input
          </HudText>
          <HudText variant="bodyMd" style={styles.formSub}>
            Help IIT Madras refine the Margi intelligence. Your situational input improves
            algorithm accuracy.
          </HudText>

          <HudText variant="mono" style={styles.inputLabel}>
            Observation category
          </HudText>
          <View style={styles.categoryRow}>
            {OFFICIAL_REPORT_OPTIONS.map((opt, i) => {
              const active = reportCategory === i;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setReportCategory(i)}
                  style={[styles.categoryChip, active && styles.categoryChipOn]}
                >
                  <HudText variant="bodySm" style={active ? styles.categoryOn : styles.categoryOff}>
                    {opt.label}
                  </HudText>
                </Pressable>
              );
            })}
          </View>

          <HudText variant="mono" style={styles.inputLabel}>
            Detailed description
          </HudText>
          <TextInput
            style={styles.textarea}
            placeholder="Provide specific details about the event or interface element…"
            placeholderTextColor={tokens.outline}
            value={reportText}
            onChangeText={setReportText}
            multiline
            maxLength={500}
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && { opacity: 0.92 },
              submitting && { opacity: 0.6 },
            ]}
            onPress={submitOfficialReport}
            disabled={submitting}
          >
            <HudText variant="mono" style={styles.submitLabel}>
              {submitting ? 'SUBMITTING…' : 'SUBMIT OFFICIAL REPORT'}
            </HudText>
          </Pressable>
        </HudCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, paddingBottom: 120, gap: 12 },
  hero: { gap: 14 },
  heroInner: { flexDirection: 'row' },
  heroTitle: { color: tokens.primary, fontFamily: 'HankenGrotesk_700Bold' },
  heroBody: { color: tokens.onSurfaceVariant, marginTop: 6, lineHeight: 22 },
  reportBtn: {
    height: 52,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  reportBtnLabel: {
    color: tokens.onSecondary,
    letterSpacing: 1.2,
    fontSize: 12,
    fontFamily: 'PublicSans_700Bold',
  },
  sectionHead: {
    // Column stack: [icon+title row] then [geo-badge chip]
    flexDirection: 'column',
    gap: 6,
    marginTop: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  // Geo-filter badge — pill chip with live dot indicator
  geoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: tokens.primaryFixed,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: tokens.primaryContainer,
  },
  geoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.secondary, // saffron = live/active
  },
  geoBadgeText: {
    fontSize: 10,
    color: tokens.primary,
    letterSpacing: 0.4,
    fontFamily: 'PublicSans_700Bold',
  },
  // Status row for loading/empty/denied — icon + text side by side
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  statusText: {
    color: tokens.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
  alertCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    padding: 14,
    overflow: 'hidden',
    ...tokens.elevation.card,
  },
  alertStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  alertHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  alertTitle: { color: tokens.onSurface, fontFamily: 'PublicSans_700Bold', flex: 1 },
  alertAgo: { color: tokens.onSurfaceVariant },
  alertBody: { color: tokens.onSurfaceVariant, marginTop: 4, lineHeight: 20 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  verifiedText: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  leaderCard: { padding: 0, overflow: 'hidden' },
  leaderBanner: {
    height: 72,
    backgroundColor: tokens.primaryContainer,
    justifyContent: 'flex-end',
    padding: 12,
  },
  leaderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: tokens.primary,
    fontSize: 10,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  leaderRowTop: { backgroundColor: tokens.primaryFixed },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCircleFirst: { backgroundColor: tokens.primary },
  rankText: { color: tokens.onSurface, fontFamily: 'PublicSans_700Bold' },
  rankFirstText: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  pioneerName: { color: tokens.onSurface, fontFamily: 'PublicSans_700Bold' },
  pioneerScore: { color: tokens.onSurfaceVariant, marginTop: 2 },
  leaderFoot: {
    textAlign: 'center',
    color: tokens.onSurfaceVariant,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
    backgroundColor: tokens.surfaceContainerLow,
  },
  formCard: { gap: 10, marginTop: 8 },
  formTitle: { color: tokens.primary, textAlign: 'center' },
  formSub: { color: tokens.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  inputLabel: { fontSize: 11, color: tokens.primary, marginTop: 8 },
  categoryRow: { gap: 8 },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.input,
    borderWidth: 1.5,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
  },
  categoryChipOn: { borderColor: tokens.primary, backgroundColor: tokens.primaryFixed },
  categoryOff: { color: tokens.onSurface },
  categoryOn: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  textarea: {
    minHeight: 100,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    borderRadius: tokens.radius.input,
    padding: 12,
    color: tokens.onSurface,
    textAlignVertical: 'top',
    fontFamily: 'PublicSans_400Regular',
    fontSize: 15,
  },
  submitBtn: {
    height: 52,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitLabel: {
    color: tokens.onPrimary,
    letterSpacing: 1,
    fontSize: 12,
    fontFamily: 'PublicSans_700Bold',
  },
});
