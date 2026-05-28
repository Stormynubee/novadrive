import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { type Href, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NovaTopBar } from '../NovaTopBar';
import { HudCard } from '../HudCard';
import { HudText } from '../HudText';
import { NovaButton } from '../NovaButton';
import { useApp } from '../../context/AppContext';
import { resolveBriefHighlightDisplay } from '../../lib/home/briefHighlightDisplay';
import {
  allChecklistComplete,
  buildBriefShareMessage,
  getSafetyBriefDetail,
  resolveBriefQuickAction,
  severityLabel,
  toggleChecklistItem,
  toggleProtocolAcknowledgment,
  type BriefQuickAction,
  type BriefSeverity,
} from '../../lib/home/safetyBriefExperience';
import { loadBriefAcknowledgments, saveBriefAcknowledgments } from '../../lib/storage';
import { tokens } from '../../theme/tokens';

function severityColors(severity: BriefSeverity) {
  switch (severity) {
    case 'active':
      return {
        pillBg: tokens.secondary,
        pillText: tokens.onSecondary,
        heroAccent: tokens.secondary,
      };
    case 'advisory':
      return {
        pillBg: tokens.primaryFixed,
        pillText: tokens.primary,
        heroAccent: tokens.primaryContainer,
      };
    default:
      return {
        pillBg: tokens.surfaceContainerHigh,
        pillText: tokens.onSurface,
        heroAccent: tokens.outlineVariant,
      };
  }
}

function quickActionIcon(name: BriefQuickAction['icon']) {
  switch (name) {
    case 'route':
      return 'alt-route' as const;
    case 'tune':
      return 'tune' as const;
    case 'share':
      return 'ios-share' as const;
    case 'warning':
      return 'report-problem' as const;
  }
}

export function SafetyBriefExperienceScreen({ slug }: { slug: string }) {
  const insets = useSafeAreaInsets();
  const { updateSettings } = useApp();
  const brief = getSafetyBriefDetail(slug);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [acknowledgedSlugs, setAcknowledgedSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadBriefAcknowledgments().then((slugs) => {
      if (mounted) {
        setAcknowledgedSlugs(slugs);
        setHydrated(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persistAcknowledgments = useCallback(async (slugs: string[]) => {
    setAcknowledgedSlugs(slugs);
    await saveBriefAcknowledgments(slugs);
  }, []);

  const handleQuickAction = useCallback(
    async (action: BriefQuickAction) => {
      if (!brief) return;
      const route = resolveBriefQuickAction(action.id);
      if (route.type === 'share') {
        try {
          await Share.share({ message: buildBriefShareMessage(brief) });
        } catch {
          /* user dismissed */
        }
        return;
      }
      if (route.type === 'settings-highlight') {
        updateSettings({ regionalProtocols: true });
        router.push('/settings' as Href);
        return;
      }
      router.push(route.href as Href);
    },
    [brief, updateSettings],
  );

  if (!brief) {
    return (
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>
        <NovaTopBar title="Safety brief" showBack onBack={() => router.back()} variant="surface" />
        <View style={styles.center}>
          <HudText variant="headlineMd" style={styles.titleNavy}>
            Brief not found
          </HudText>
          <HudText variant="bodyMd" style={styles.muted}>
            This advisory may have been archived or the link is invalid.
          </HudText>
          <NovaButton label="Back" onPress={() => router.back()} large />
        </View>
      </View>
    );
  }

  const colors = severityColors(brief.severity);
  const checklistDone = allChecklistComplete(completedIds, brief.checklist);
  const acknowledged = acknowledgedSlugs.includes(brief.slug);
  const related = brief.relatedSlug ? getSafetyBriefDetail(brief.relatedSlug) : null;

  const onAcknowledge = () => {
    if (!checklistDone) {
      Alert.alert(
        'Complete driver checklist',
        'Confirm each action item before acknowledging this brief for your journey record.',
      );
      return;
    }
    const next = toggleProtocolAcknowledgment(acknowledgedSlugs, brief.slug);
    void persistAcknowledgments(next);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <NovaTopBar title={brief.title} showBack onBack={() => router.back()} variant="surface" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.heroStripe, { backgroundColor: colors.heroAccent }]} />
          <View style={styles.heroBody}>
            <View style={styles.heroTopRow}>
              <View style={[styles.severityPill, { backgroundColor: colors.pillBg }]}>
                <HudText variant="bodySm" style={[styles.severityText, { color: colors.pillText }]}>
                  {severityLabel(brief.severity)}
                </HudText>
              </View>
              <HudText variant="mono" style={styles.refCode}>
                {brief.referenceCode}
              </HudText>
            </View>
            <HudText variant="headlineLg" style={styles.heroTitle}>
              {brief.title}
            </HudText>
            <HudText variant="bodySm" style={styles.heroMeta}>
              {brief.issuedAt}
            </HudText>
            <View style={styles.metaRow}>
              <MaterialIcons name="place" size={14} color={tokens.onPrimary} style={styles.metaIcon} />
              <HudText variant="bodySm" style={styles.heroRegion} numberOfLines={2}>
                {brief.region}
              </HudText>
            </View>
            <HudText variant="bodySm" style={styles.heroUntil} numberOfLines={1}>
              Valid {brief.effectiveUntil}
            </HudText>
          </View>
          <View style={styles.heroGrid} pointerEvents="none">
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={styles.heroGridCell} />
            ))}
          </View>
        </View>

        <HudCard style={styles.statCard}>
          {brief.highlights.map((h, index) => {
            const display = resolveBriefHighlightDisplay(h);
            return (
              <View
                key={h.label}
                style={[styles.statStripRow, index > 0 ? styles.statStripDivider : undefined]}
              >
                <HudText variant="bodySm" style={styles.statLabel} numberOfLines={1}>
                  {display.label}
                </HudText>
                <HudText
                  variant="headlineMd"
                  style={styles.statValue}
                  numberOfLines={2}
                >
                  {display.value}
                </HudText>
              </View>
            );
          })}
        </HudCard>

        {brief.affectedCorridors.length > 0 ? (
          <HudCard accent="secondary" style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <MaterialIcons name="traffic" size={20} color={tokens.secondary} />
              <HudText variant="headlineMd" style={styles.sectionTitle}>
                Affected corridors
              </HudText>
            </View>
            <View style={styles.chipWrap}>
              {brief.affectedCorridors.map((corridor) => (
                <View key={corridor} style={styles.corridorChip}>
                  <MaterialIcons name="near-me" size={14} color={tokens.secondaryDeep} />
                  <HudText variant="bodySm" style={styles.chipText}>
                    {corridor}
                  </HudText>
                </View>
              ))}
            </View>
          </HudCard>
        ) : null}

        <HudCard accent="primary" style={styles.sectionCard}>
          <View style={styles.sectionHead}>
            <MaterialIcons name="fact-check" size={20} color={tokens.primary} />
            <HudText variant="headlineMd" style={styles.sectionTitle}>
              Driver checklist
            </HudText>
          </View>
          <HudText variant="bodySm" style={styles.checkHint}>
            Tap each item when completed. Acknowledgment unlocks after all items are checked.
          </HudText>
          {brief.checklist.map((item) => {
            const done = completedIds.includes(item.id);
            return (
              <Pressable
                key={item.id}
                style={[styles.checkRow, done && styles.checkRowDone]}
                onPress={() => setCompletedIds((prev) => toggleChecklistItem(prev, item.id))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
              >
                <View style={[styles.checkBox, done && styles.checkBoxOn]}>
                  {done ? <MaterialIcons name="check" size={16} color={tokens.onSecondary} /> : null}
                </View>
                <HudText variant="bodyMd" style={[styles.checkLabel, done && styles.checkLabelDone]}>
                  {item.label}
                </HudText>
              </Pressable>
            );
          })}
        </HudCard>

        <HudCard style={styles.sectionCard}>
          <View style={styles.sectionHead}>
            <MaterialIcons name="article" size={20} color={tokens.primary} />
            <HudText variant="headlineMd" style={styles.sectionTitle}>
              Official briefing
            </HudText>
          </View>
          {brief.paragraphs.map((p, index) => (
            <View key={p.slice(0, 20)} style={index > 0 ? styles.paragraphGap : undefined}>
              <HudText variant="bodyMd" style={styles.paragraph}>
                {p}
              </HudText>
            </View>
          ))}
        </HudCard>

        <HudText variant="bodySm" style={styles.quickLabel}>
          Quick actions
        </HudText>
        <View style={styles.quickGrid}>
          {brief.quickActions.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [styles.quickTile, pressed && styles.quickTilePressed]}
              onPress={() => void handleQuickAction(action)}
            >
              <View style={styles.quickIconWrap}>
                <MaterialIcons
                  name={quickActionIcon(action.icon)}
                  size={22}
                  color={tokens.primary}
                />
              </View>
              <HudText variant="bodySm" style={styles.quickTileLabel}>
                {action.label}
              </HudText>
            </Pressable>
          ))}
        </View>

        {related ? (
          <Pressable
            style={styles.relatedLink}
            onPress={() => router.push(`/brief/${related.slug}` as Href)}
          >
            <MaterialIcons name="link" size={18} color={tokens.primary} />
            <HudText variant="bodyMd" style={styles.relatedText}>
              Related: {related.title}
            </HudText>
            <MaterialIcons name="chevron-right" size={22} color={tokens.outline} />
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {acknowledged ? (
          <View style={styles.ackBanner}>
            <MaterialIcons name="verified" size={20} color={tokens.tertiary} />
            <HudText variant="bodySm" style={styles.ackBannerText}>
              Acknowledged for this device · journey desk notified locally
            </HudText>
          </View>
        ) : null}
        <NovaButton
          label={acknowledged ? 'Withdraw acknowledgment' : 'Acknowledge brief'}
          onPress={onAcknowledge}
          variant={acknowledged ? 'ghost' : checklistDone ? 'primary' : 'ghost'}
          disabled={!hydrated}
          large
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: {
    padding: tokens.spacing.gutter,
    paddingBottom: 120,
    gap: tokens.spacing.stackMd,
  },
  center: {
    flex: 1,
    padding: tokens.spacing.gutter,
    justifyContent: 'center',
    gap: 12,
  },
  titleNavy: { color: tokens.primary },
  muted: { color: tokens.onSurfaceVariant, marginBottom: 8 },
  hero: {
    backgroundColor: tokens.primary,
    borderRadius: tokens.radius.card,
    overflow: 'hidden',
    ...tokens.elevation.floating,
  },
  heroStripe: {
    position: 'absolute',
    right: -40,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.35,
  },
  heroGrid: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.06,
  },
  heroGridCell: {
    width: '33.33%',
    aspectRatio: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.onPrimary,
  },
  heroBody: { padding: tokens.spacing.sideMargin, gap: 8 },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tokens.radius.chip,
  },
  severityText: { fontFamily: 'HankenGrotesk_700Bold', letterSpacing: 1.2 },
  refCode: { color: tokens.primaryFixedDim, opacity: 0.9 },
  heroTitle: { color: tokens.onPrimary, fontFamily: 'HankenGrotesk_800ExtraBold' },
  heroMeta: { color: tokens.primaryFixedDim },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  metaIcon: { marginTop: 2 },
  heroRegion: { flex: 1, color: tokens.onPrimary, opacity: 0.92 },
  heroUntil: { color: tokens.primaryFixedDim, marginTop: 2 },
  statCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  statStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: tokens.spacing.gutter,
    paddingVertical: 14,
  },
  statStripDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.outlineVariant,
  },
  statLabel: {
    flexShrink: 0,
    maxWidth: '42%',
    color: tokens.onSurfaceVariant,
    letterSpacing: 0.8,
    fontFamily: 'PublicSans_600SemiBold',
  },
  statValue: {
    flex: 1,
    flexShrink: 1,
    textAlign: 'right',
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 17,
    lineHeight: 22,
  },
  sectionCard: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: tokens.primary, fontFamily: 'HankenGrotesk_700Bold' },
  checkHint: { color: tokens.onSurfaceVariant, marginBottom: 4 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: tokens.radius.input,
    backgroundColor: tokens.surfaceContainerLow,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  checkRowDone: {
    backgroundColor: tokens.tertiaryFixedDim + '33',
    borderColor: tokens.tertiary,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: tokens.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkBoxOn: {
    backgroundColor: tokens.tertiary,
    borderColor: tokens.tertiary,
  },
  checkLabel: { flex: 1, color: tokens.onSurface, lineHeight: 22 },
  checkLabelDone: { color: tokens.onSurfaceVariant },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  corridorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radius.chip,
    backgroundColor: tokens.secondaryFixed,
    borderWidth: 1,
    borderColor: tokens.secondaryFixedDim,
  },
  chipText: { color: tokens.onSecondaryContainer, fontFamily: 'PublicSans_600SemiBold' },
  paragraph: { color: tokens.onSurface, lineHeight: 24 },
  paragraphGap: { marginTop: 12 },
  quickLabel: {
    color: tokens.onSurfaceVariant,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickTile: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    padding: 14,
    gap: 10,
    ...tokens.elevation.card,
  },
  quickTilePressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.iconWrap,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTileLabel: {
    color: tokens.primary,
    fontFamily: 'PublicSans_600SemiBold',
  },
  relatedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.outlineVariant,
  },
  relatedText: { flex: 1, color: tokens.primary, fontFamily: 'PublicSans_600SemiBold' },
  footer: {
    paddingHorizontal: tokens.spacing.gutter,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
    gap: 10,
  },
  ackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: tokens.radius.input,
    backgroundColor: tokens.tertiaryFixedDim + '44',
  },
  ackBannerText: { flex: 1, color: tokens.onTertiaryContainer },
});
