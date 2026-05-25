import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

/**
 * NovaDrive emblem — Deep Navy shield with a saffron upward arrow. Echoes the GovTech splash
 * (`nova_drive_professional_splash_screen`).
 *
 * `tone="onLight"` (default) for white surfaces; `tone="onDark"` reverses fills for the splash.
 */
export function NovaLogo({
  size = 96,
  showWordmark = true,
  tone = 'onLight',
}: {
  size?: number;
  showWordmark?: boolean;
  tone?: 'onLight' | 'onDark';
}) {
  const onDark = tone === 'onDark';
  const shield = onDark ? tokens.onPrimary : tokens.primary;
  const arrow = tokens.secondary;
  const wordPrimary = onDark ? tokens.onPrimary : tokens.primary;
  const wordSecondary = arrow;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.tile,
          {
            width: size + 24,
            height: size + 24,
            borderRadius: tokens.radius.iconWrap,
            backgroundColor: onDark ? 'rgba(255,255,255,0.08)' : tokens.surface,
            borderColor: onDark ? 'rgba(255,255,255,0.18)' : tokens.outlineVariant,
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 96 96">
          {/* Shield silhouette — institutional emblem */}
          <Path
            d="M48 6 L84 18 V46 C84 70 66 86 48 92 C30 86 12 70 12 46 V18 Z"
            fill={shield}
            stroke={onDark ? 'rgba(255,255,255,0.4)' : tokens.outlineVariant}
            strokeWidth={1.5}
          />
          {/* Inner saffron chevron / arrow */}
          <Path
            d="M30 60 L48 30 L66 60"
            stroke={arrow}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Tiny safety dot (nation tricolor green) */}
          <Circle cx={48} cy={70} r={4} fill={tokens.tertiaryFixedDim} />
        </Svg>
      </View>
      {showWordmark ? (
        <View style={styles.wordmark}>
          <HudText variant="headlineLg" style={[styles.nova, { color: wordPrimary }]}>
            NOVA
          </HudText>
          <HudText variant="headlineLg" style={[styles.drive, { color: wordSecondary }]}>
            DRIVE
          </HudText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 14 },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  wordmark: { flexDirection: 'row', gap: 10 },
  nova: { fontFamily: 'HankenGrotesk_800ExtraBold', letterSpacing: 1.5 },
  drive: { fontFamily: 'HankenGrotesk_800ExtraBold', letterSpacing: 1.5 },
});
