import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { HudText } from './HudText';
import {
  CORRIDOR_DEST,
  CORRIDOR_ORIGIN,
  CORRIDOR_PATHS,
  MAP_BLOCKS,
  MAP_PARKS,
  MAP_ROADS,
  MAP_VIEWBOX,
  MAP_WATER,
  type CorridorRouteId,
} from '../lib/corridorMapGeometry';
import { tokens } from '../theme/tokens';

export function PlanCorridorMap({
  routeId,
  preference,
  hasDestination,
}: {
  routeId: CorridorRouteId;
  preference: 'safest' | 'fastest';
  hasDestination: boolean;
}) {
  const activePath = CORRIDOR_PATHS[routeId];
  const ghostId: CorridorRouteId = routeId === 'alpha' ? 'beta' : 'alpha';
  const ghostPath = CORRIDOR_PATHS[ghostId];
  const routeOpacity = hasDestination ? 1 : 0.45;
  const showGhost = hasDestination && preference === 'safest';

  return (
    <View style={styles.wrap}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${MAP_VIEWBOX.w} ${MAP_VIEWBOX.h}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Path d={`M0 0 H${MAP_VIEWBOX.w} V${MAP_VIEWBOX.h} H0 Z`} fill={tokens.surfaceContainerLow} />

        {MAP_BLOCKS.map((block, i) => (
          <Path key={`block-${i}`} d={block.d} fill={block.fill} />
        ))}

        <Path d={MAP_WATER} fill={tokens.primaryFixed} opacity={0.35} />

        {MAP_PARKS.map((d, i) => (
          <Path key={`park-${i}`} d={d} fill={tokens.tertiaryFixedDim} opacity={0.22} />
        ))}

        {MAP_ROADS.map((road, i) => (
          <Line
            key={`road-${i}`}
            x1={road.x1}
            y1={road.y1}
            x2={road.x2}
            y2={road.y2}
            stroke={tokens.outlineVariant}
            strokeWidth={road.w ?? 1.5}
            opacity={0.55}
          />
        ))}

        {showGhost ? (
          <Path
            d={ghostPath}
            stroke={tokens.outline}
            strokeWidth={2}
            strokeDasharray="6 5"
            fill="none"
            opacity={0.28}
          />
        ) : null}

        <Path
          d={activePath}
          stroke={tokens.primary}
          strokeWidth={hasDestination ? 3 : 2}
          fill="none"
          opacity={hasDestination ? 0.4 : 0.25}
        />
        <Path
          d={activePath}
          stroke={tokens.secondary}
          strokeWidth={hasDestination ? 4 : 3}
          strokeDasharray={hasDestination ? undefined : '8 6'}
          fill="none"
          opacity={routeOpacity}
        />

        <Path
          d={`M ${CORRIDOR_ORIGIN.x} ${CORRIDOR_ORIGIN.y} m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0`}
          fill={tokens.primary}
        />
        {hasDestination ? (
          <Path
            d={`M ${CORRIDOR_DEST.x} ${CORRIDOR_DEST.y} m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0`}
            fill={tokens.secondary}
          />
        ) : null}
      </Svg>

      <View style={styles.reticle} pointerEvents="none">
        <View style={styles.reticleRing}>
          <View style={styles.reticleDot} />
        </View>
      </View>

      <View style={styles.chip} pointerEvents="none">
        <HudText variant="mono" style={styles.chipText}>
          CORRIDOR PREVIEW · OFFLINE
        </HudText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: tokens.surfaceContainerHigh,
    overflow: 'hidden',
  },
  reticle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: tokens.primary,
    backgroundColor: 'rgba(0,10,30,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.primary,
  },
  chip: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.button,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 9,
    letterSpacing: 1.1,
    color: tokens.onSurfaceVariant,
  },
});
