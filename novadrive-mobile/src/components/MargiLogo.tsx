import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { APP_DISPLAY_NAME, APP_TAGLINE } from '../lib/brand';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

const BLUE = '#0056b3';
const ORANGE = '#ff8c00';

/**
 * Margi emblem — abstract heart, path, and EKG pulse (vector approximation of brand logo).
 */
export function MargiLogoMark({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="pathGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor={BLUE} />
          <Stop offset="100%" stopColor={ORANGE} stopOpacity={0.85} />
        </LinearGradient>
      </Defs>
      {/* Left figure */}
      <Path
        d="M18 88 C18 52 28 28 42 22 C48 20 52 24 50 38 C46 58 38 72 32 88 Z"
        fill={BLUE}
      />
      <Circle cx={42} cy={20} r={10} fill={BLUE} />
      {/* Right figure */}
      <Path
        d="M102 88 C102 52 92 28 78 22 C72 20 68 24 70 38 C74 58 82 72 88 88 Z"
        fill={ORANGE}
      />
      <Circle cx={78} cy={20} r={10} fill={ORANGE} />
      {/* Winding path */}
      <Path
        d="M42 92 C52 78 58 68 60 58 C62 48 58 42 60 36"
        stroke="url(#pathGrad)"
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      {/* EKG pulse */}
      <Path
        d="M48 52 H54 L58 44 L62 60 L66 48 H72"
        stroke={ORANGE}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function MargiLogo({
  size = 96,
  showWordmark = true,
  showTagline = false,
  tone = 'onLight',
}: {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  tone?: 'onLight' | 'onDark';
}) {
  const onDark = tone === 'onDark';
  const wordColor = onDark ? tokens.onPrimary : tokens.primary;
  const subColor = onDark ? tokens.onPrimaryContainer : tokens.onSurfaceVariant;

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
        <MargiLogoMark size={size} />
      </View>
      {showWordmark ? (
        <HudText variant="headlineLg" style={[styles.wordmark, { color: wordColor }]}>
          {APP_DISPLAY_NAME}
        </HudText>
      ) : null}
      {showTagline ? (
        <HudText variant="bodySm" style={[styles.tagline, { color: subColor }]}>
          {APP_TAGLINE}
        </HudText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  wordmark: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: 0.5,
    fontSize: 28,
  },
  tagline: {
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
});
