/** Offline cartography for Plan Corridor map (viewBox 360×220). */

export const MAP_VIEWBOX = { w: 360, h: 220 } as const;

export type CorridorRouteId = 'alpha' | 'beta';

/** Safest corridor — follows major blocks (Gov suggested). */
export const CORRIDOR_PATH_ALPHA =
  'M 32 192 L 32 152 L 72 152 L 72 118 L 128 118 L 128 88 L 188 88 L 188 58 L 248 58 L 248 42 L 318 32';

/** Express corridor — shorter, more direct. */
export const CORRIDOR_PATH_BETA =
  'M 32 192 L 108 168 L 168 118 L 228 72 L 318 32';

export const CORRIDOR_PATHS: Record<CorridorRouteId, string> = {
  alpha: CORRIDOR_PATH_ALPHA,
  beta: CORRIDOR_PATH_BETA,
};

export const CORRIDOR_ORIGIN = { x: 32, y: 192 };
export const CORRIDOR_DEST = { x: 318, y: 32 };

/** Urban blocks — muted institutional parcels. */
export const MAP_BLOCKS: { d: string; fill: string }[] = [
  { d: 'M 0 0 H 140 V 95 H 0 Z', fill: '#e8ebe9' },
  { d: 'M 148 0 H 360 V 72 H 148 Z', fill: '#e4e7e5' },
  { d: 'M 0 103 H 95 V 220 H 0 Z', fill: '#e2e5e3' },
  { d: 'M 200 80 H 360 V 220 H 200 Z', fill: '#e6e9e7' },
];

/** Parks — flat green-gray. */
export const MAP_PARKS: string[] = [
  'M 155 78 H 198 V 108 H 155 Z',
  'M 48 58 H 88 V 88 H 48 Z',
];

/** Water — soft blue-gray. */
export const MAP_WATER = 'M 248 8 Q 300 12 340 40 Q 360 70 360 95 L 280 95 Q 250 60 248 8 Z';

/** Road centerlines — orthogonal mesh, not spreadsheet grid. */
export const MAP_ROADS: { x1: number; y1: number; x2: number; y2: number; w?: number }[] = [
  { x1: 0, y1: 98, x2: 360, y2: 98, w: 2.5 },
  { x1: 0, y1: 155, x2: 360, y2: 155, w: 2 },
  { x1: 95, y1: 0, x2: 95, y2: 220, w: 2 },
  { x1: 145, y1: 0, x2: 145, y2: 220, w: 2.5 },
  { x1: 200, y1: 0, x2: 200, y2: 220, w: 2 },
  { x1: 255, y1: 0, x2: 255, y2: 140, w: 1.5 },
  { x1: 32, y1: 0, x2: 32, y2: 220, w: 2.5 },
  { x1: 72, y1: 118, x2: 200, y2: 118, w: 1.5 },
  { x1: 128, y1: 58, x2: 128, y2: 155, w: 1.5 },
  { x1: 188, y1: 58, x2: 318, y2: 58, w: 2 },
];
