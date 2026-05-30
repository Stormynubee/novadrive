import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import {
  incidentCardOverflow,
  priorityBadgeTopOffset,
} from '../../lib/emergency/emergencyIncidentCardLayout';
import type { IncidentOption } from '../../lib/emergency/incidentCatalog';
import { tokens } from '../../theme/tokens';

const ACCENT = {
  primary: {
    title: tokens.primary,
    iconBg: tokens.primaryFixed,
    iconFg: tokens.primary,
    ctaBg: tokens.primary,
    ctaFg: tokens.onPrimary,
    stripe: tokens.primary,
    border: tokens.outlineVariant,
  },
  secondary: {
    title: tokens.secondaryDeep,
    iconBg: tokens.secondaryContainer,
    iconFg: tokens.onSecondary,
    ctaBg: tokens.secondaryDeep,
    ctaFg: tokens.onSecondary,
    stripe: tokens.secondaryDeep,
    border: tokens.secondaryDeep,
  },
  error: {
    title: tokens.error,
    iconBg: tokens.errorContainer,
    iconFg: tokens.error,
    ctaBg: tokens.error,
    ctaFg: tokens.onError,
    stripe: tokens.error,
    border: tokens.outlineVariant,
  },
} as const;

export function EmergencyIncidentCard({
  option,
  onPress,
}: {
  option: IncidentOption;
  onPress: () => void;
}) {
  const accent = ACCENT[option.accent];
  const highlighted = option.priority === 'high';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${option.title}. ${option.description}`}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.cardHighlighted,
        { borderColor: accent.border },
        pressed && styles.pressed,
      ]}
    >
      {highlighted ? (
        <View style={styles.priorityBadge}>
          <HudText variant="mono" style={styles.priorityText}>
            HIGH PRIORITY
          </HudText>
        </View>
      ) : null}
      <View style={[styles.stripe, { backgroundColor: accent.stripe, width: highlighted ? 6 : 4 }]} />
      <View
        style={[
          styles.iconWrap,
          highlighted && styles.iconWrapLarge,
          { backgroundColor: accent.iconBg },
        ]}
      >
        <MaterialIcons
          name={option.icon}
          size={highlighted ? 48 : 40}
          color={accent.iconFg}
        />
      </View>
      <HudText variant="headlineMd" style={[styles.title, { color: accent.title }]}>
        {option.title}
      </HudText>
      <HudText variant="bodyMd" style={styles.description}>
        {option.description}
      </HudText>
      <View
        style={[
          styles.cta,
          highlighted && styles.ctaLarge,
          { backgroundColor: accent.ctaBg },
        ]}
      >
        <HudText variant="mono" style={[styles.ctaLabel, { color: accent.ctaFg }]}>
          {option.ctaLabel}
        </HudText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    alignItems: 'center',
    padding: tokens.spacing.stackLg,
    paddingTop: tokens.spacing.stackLg + 20,
    backgroundColor: tokens.surfaceContainerLowest,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    overflow: incidentCardOverflow(),
  },
  cardHighlighted: {
    borderWidth: 2,
    marginVertical: 4,
    shadowColor: tokens.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  pressed: { backgroundColor: tokens.surfaceContainer, transform: [{ scale: 0.99 }] },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: tokens.radius.card,
    borderBottomLeftRadius: tokens.radius.card,
  },
  priorityBadge: {
    position: 'absolute',
    top: priorityBadgeTopOffset(),
    alignSelf: 'center',
    backgroundColor: tokens.secondaryDeep,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: tokens.radius.chip,
    zIndex: 1,
  },
  priorityText: {
    color: tokens.onSecondary,
    fontSize: 11,
    letterSpacing: 1.2,
    fontFamily: 'PublicSans_700Bold',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.stackMd,
  },
  iconWrapLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'HankenGrotesk_700Bold',
  },
  description: {
    textAlign: 'center',
    color: tokens.onSurfaceVariant,
    marginBottom: tokens.spacing.stackMd,
    lineHeight: 24,
  },
  cta: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: tokens.radius.button,
    alignItems: 'center',
  },
  ctaLarge: {
    paddingVertical: 16,
  },
  ctaLabel: {
    letterSpacing: 1.4,
    fontSize: 13,
    fontFamily: 'PublicSans_700Bold',
  },
});
