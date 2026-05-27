import { type Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmergencyIncidentCard } from '../../src/components/emergency/EmergencyIncidentCard';
import { HudText } from '../../src/components/HudText';
import { useApp } from '../../src/context/AppContext';
import {
  CANCEL_SOS_SECONDS,
  canCancelSos,
  formatCancelSosLabel,
  nextCancelSeconds,
} from '../../src/lib/emergency/cancelSosCountdown';
import { INCIDENT_OPTIONS } from '../../src/lib/emergency/incidentCatalog';
import type { IncidentType } from '../../src/lib/types';
import { tokens } from '../../src/theme/tokens';

/**
 * Stitch Emergency Selection — choose incident type before START triage.
 */
export default function EmergencySelectionScreen() {
  const { setIncidentType, resetEmergency } = useApp();
  const [cancelSeconds, setCancelSeconds] = useState(CANCEL_SOS_SECONDS);

  useEffect(() => {
    const id = setInterval(() => {
      setCancelSeconds((s) => nextCancelSeconds(s));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const cancelEnabled = canCancelSos(cancelSeconds);

  const onSelect = (type: IncidentType) => {
    setIncidentType(type);
    router.push('/emergency/triage' as Href);
  };

  const onCancel = () => {
    if (!cancelEnabled) return;
    resetEmergency();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/explore' as Href);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.watermark} pointerEvents="none">
        <MaterialIcons name="verified-user" size={280} color={tokens.primary} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="emergency" size={22} color={tokens.onPrimary} />
          <HudText variant="headlineMd" style={styles.headerTitle} numberOfLines={1}>
            Nova Drive | Incident Tracker
          </HudText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={styles.headerIconBtn}
        >
          <MaterialIcons name="notifications-active" size={24} color={tokens.onPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.intro}>
          <HudText variant="headlineLg" style={styles.screenTitle}>
            Emergency Selection
          </HudText>
          <HudText variant="bodyMd" style={styles.screenSub}>
            Select the incident type for immediate institutional response and specialized
            protocols.
          </HudText>
        </View>

        <View style={styles.cards}>
          {INCIDENT_OPTIONS.map((option) => (
            <EmergencyIncidentCard
              key={option.id}
              option={option}
              onPress={() => onSelect(option.id)}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={formatCancelSosLabel(cancelSeconds)}
          accessibilityState={{ disabled: !cancelEnabled }}
          onPress={onCancel}
          disabled={!cancelEnabled}
          style={[styles.cancelBtn, !cancelEnabled && styles.cancelBtnDisabled]}
        >
          <MaterialIcons
            name="close"
            size={22}
            color={cancelEnabled ? tokens.primary : tokens.outline}
          />
          <HudText
            variant="mono"
            style={[styles.cancelLabel, !cancelEnabled && styles.cancelLabelDisabled]}
          >
            {formatCancelSosLabel(cancelSeconds)}
          </HudText>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <HudText variant="bodySm" style={styles.footerText}>
          Nova Drive Platform
        </HudText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.background },
  watermark: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.03,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.gutter,
    height: 64,
    backgroundColor: tokens.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outline,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  headerTitle: {
    flex: 1,
    color: tokens.onPrimary,
    fontSize: 16,
    fontFamily: 'HankenGrotesk_700Bold',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingTop: tokens.spacing.stackLg,
    paddingBottom: tokens.spacing.stackLg,
    gap: tokens.spacing.stackLg,
  },
  intro: { alignItems: 'center', gap: 8 },
  screenTitle: {
    color: tokens.primary,
    textAlign: 'center',
    fontFamily: 'HankenGrotesk_700Bold',
  },
  screenSub: {
    color: tokens.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 24,
  },
  cards: { gap: tokens.spacing.gutter },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 64,
    borderWidth: 2,
    borderColor: tokens.primary,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.surfaceContainerLowest,
  },
  cancelBtnDisabled: {
    opacity: 0.5,
    borderColor: tokens.outlineVariant,
  },
  cancelLabel: {
    color: tokens.primary,
    letterSpacing: 1,
    fontFamily: 'PublicSans_700Bold',
  },
  cancelLabelDisabled: {
    color: tokens.outline,
  },
  footer: {
    backgroundColor: tokens.primary,
    paddingVertical: 16,
    paddingHorizontal: tokens.spacing.sideMargin,
    alignItems: 'center',
  },
  footerText: {
    color: tokens.onPrimaryContainer,
    letterSpacing: 0.5,
  },
});
