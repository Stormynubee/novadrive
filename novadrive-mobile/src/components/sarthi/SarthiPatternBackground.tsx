import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { tokens } from '../../theme/tokens';

/** Subtle geometric backdrop for Sarthi surfaces */
export function SarthiPatternBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Line x1="0" y1="40" x2="400" y2="120" stroke={tokens.primary} strokeOpacity={0.04} strokeWidth={1} />
        <Line x1="80" y1="0" x2="200" y2="400" stroke={tokens.secondary} strokeOpacity={0.05} strokeWidth={1} />
        <Circle cx="320" cy="80" r="48" stroke={tokens.primary} strokeOpacity={0.05} fill="none" />
        <Circle cx="60" cy="200" r="32" stroke={tokens.secondary} strokeOpacity={0.06} fill="none" />
      </Svg>
    </View>
  );
}
