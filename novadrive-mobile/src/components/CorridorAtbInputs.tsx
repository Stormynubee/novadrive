import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
import { tokens } from '../theme/tokens';

const ROW_H = 48;
const CARD_PAD = 12;
/** Matches Stitch HTML `top-[44px]` / `bottom-[44px]` on the rail line. */
const LINE_INSET = 44;
/** Icon column center (~ `left-7` in Tailwind). */
const LINE_LEFT = CARD_PAD + 16;

/**
 * Plan Corridor A→B inputs — Stitch `plan_corridor_route_planning` rail + fields.
 * Continuous dashed connector on the left; divider only spans the text column.
 */
export function CorridorAtbInputs({
  origin,
  destination,
  onDestinationChange,
}: {
  origin: string;
  destination: string;
  onDestinationChange: (text: string) => void;
}) {
  const [cardHeight, setCardHeight] = useState(0);
  const lineHeight = Math.max(0, cardHeight - LINE_INSET * 2);

  return (
    <View
      style={styles.card}
      onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
    >
      {lineHeight > 0 ? (
        <View
          style={[styles.railLine, { top: LINE_INSET, height: lineHeight, left: LINE_LEFT }]}
          pointerEvents="none"
        >
          <Svg width={2} height={lineHeight}>
            <Line
              x1={1}
              y1={0}
              x2={1}
              y2={lineHeight}
              stroke={tokens.outline}
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          </Svg>
        </View>
      ) : null}

      <View style={styles.row}>
        <MaterialIcons name="my-location" size={20} color={tokens.primary} />
        <TextInput
          style={styles.input}
          value={origin}
          editable={false}
          selectTextOnFocus={false}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <MaterialIcons name="location-on" size={20} color={tokens.secondary} />
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={onDestinationChange}
          placeholder="Enter Destination ID or Area"
          placeholderTextColor={tokens.outline}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: tokens.surfaceContainerLowest,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    padding: CARD_PAD,
    marginBottom: tokens.spacing.stackMd,
    ...tokens.elevation.card,
  },
  railLine: {
    position: 'absolute',
    width: 2,
    zIndex: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: ROW_H,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    paddingHorizontal: 12,
    zIndex: 2,
  },
  divider: {
    height: 1,
    marginVertical: 6,
    marginLeft: 48,
    backgroundColor: 'rgba(196,198,207,0.35)',
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'PublicSans_400Regular',
    color: tokens.onSurface,
    paddingVertical: 0,
  },
});
