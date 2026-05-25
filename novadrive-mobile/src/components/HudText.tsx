import { Text, TextProps, TextStyle } from 'react-native';
import { useApp } from '../context/AppContext';
import { resolveFontScale } from '../lib/storage';
import { typography } from '../theme/typography';
import { useThemeTokens } from '../theme/useThemeTokens';

type Variant = 'display' | 'headlineLg' | 'headlineMd' | 'bodyLg' | 'bodyMd' | 'bodySm' | 'mono' | 'monoData';

const variantStyle: Record<Variant, TextStyle> = {
  display: typography.display,
  headlineLg: typography.headlineLg,
  headlineMd: typography.headlineMd,
  bodyLg: typography.bodyLg,
  bodyMd: typography.bodyMd,
  bodySm: typography.bodySm,
  mono: typography.dataLabel,
  monoData: typography.dataValue,
};

export function HudText({
  variant = 'bodyMd',
  children,
  style,
  color,
  ...rest
}: TextProps & { variant?: Variant; color?: string }) {
  const { a11y } = useApp();
  const tokens = useThemeTokens();
  const scale = resolveFontScale(a11y);
  const base = variantStyle[variant];
  const fontSize = (base.fontSize ?? 16) * scale;
  const lineHeight = (base.lineHeight ?? 22) * scale;
  const defaultColor = a11y.highContrast ? tokens.onSurface : undefined;

  return (
    <Text
      style={[
        base,
        { fontSize, lineHeight },
        defaultColor ? { color: defaultColor } : null,
        color ? { color } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
