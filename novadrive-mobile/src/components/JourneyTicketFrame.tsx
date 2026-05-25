import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

/**
 * GovTech "official report" manifest — white card with navy stripe header, dashed perforation,
 * Ashoka Chakra-feel watermark hint via subtle navy outline. Mirrors the journey-summary block
 * in `nova_drive_safe_journey_summary_feedback`.
 */
export function JourneyTicketFrame({
  children,
  serial,
}: {
  children: ReactNode;
  serial: string;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.cutCornerTL} />
      <View style={styles.cutCornerTR} />
      <View style={styles.ticket}>
        <View style={styles.topStripe}>
          <HudText variant="mono" style={styles.stripeLabel}>
            NOVADRIVE · JOURNEY MANIFEST
          </HudText>
          <HudText variant="mono" style={styles.serial}>
            #{serial}
          </HudText>
        </View>
        <View style={styles.perforation}>
          <Svg width="100%" height={6} viewBox="0 0 300 6" preserveAspectRatio="none">
            <Line
              x1={0}
              y1={3}
              x2={300}
              y2={3}
              stroke={tokens.primary}
              strokeWidth={1}
              strokeDasharray="6 5"
              opacity={0.35}
            />
          </Svg>
        </View>
        <View style={styles.body}>{children}</View>
        <View style={styles.perforation}>
          <Svg width="100%" height={6} viewBox="0 0 300 6" preserveAspectRatio="none">
            <Line
              x1={0}
              y1={3}
              x2={300}
              y2={3}
              stroke={tokens.outline}
              strokeWidth={1}
              strokeDasharray="3 4"
              opacity={0.5}
            />
          </Svg>
        </View>
        <HudText variant="mono" style={styles.footer}>
          ARCHIVED FOR CORRIDOR INTELLIGENCE · SHARED ANONYMOUSLY
        </HudText>
      </View>
      <View style={styles.cutCornerBL} />
      <View style={styles.cutCornerBR} />
    </View>
  );
}

const CORNER = 16;

const styles = StyleSheet.create({
  wrap: { position: 'relative', marginVertical: 8 },
  ticket: {
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    overflow: 'hidden',
    ...tokens.elevation.card,
  },
  topStripe: {
    backgroundColor: tokens.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stripeLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: tokens.onPrimary,
    fontFamily: 'HankenGrotesk_700Bold',
  },
  serial: {
    fontSize: 10,
    color: tokens.onPrimaryContainer,
    letterSpacing: 1,
    fontFamily: 'PublicSans_700Bold',
  },
  perforation: { paddingHorizontal: 8 },
  body: { padding: 18, gap: 14 },
  footer: {
    fontSize: 9,
    letterSpacing: 1.4,
    textAlign: 'center',
    color: tokens.onSurfaceVariant,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  cutCornerTL: {
    position: 'absolute',
    top: -1,
    left: 12,
    width: CORNER,
    height: CORNER,
    backgroundColor: tokens.background,
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  cutCornerTR: {
    position: 'absolute',
    top: -1,
    right: 12,
    width: CORNER,
    height: CORNER,
    backgroundColor: tokens.background,
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  cutCornerBL: {
    position: 'absolute',
    bottom: -1,
    left: 12,
    width: CORNER,
    height: CORNER,
    backgroundColor: tokens.background,
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  cutCornerBR: {
    position: 'absolute',
    bottom: -1,
    right: 12,
    width: CORNER,
    height: CORNER,
    backgroundColor: tokens.background,
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
});
