/** Margi drive HUD layout constants (v1.6.0). */
export const HUD_SPEEDO_SIZE = 168;
export const HUD_SOS_ZONE = 'top' as const;
export const HUD_SPEED_DIGIT_SIZE = 40;

export type HudLayoutSpec = {
  sosZone: typeof HUD_SOS_ZONE;
  speedoSize: number;
  speedDigitSize: number;
  scrollWhileDriving: boolean;
};

export function getHudLayoutSpec(): HudLayoutSpec {
  return {
    sosZone: HUD_SOS_ZONE,
    speedoSize: HUD_SPEEDO_SIZE,
    speedDigitSize: HUD_SPEED_DIGIT_SIZE,
    scrollWhileDriving: false,
  };
}

/** SOS should render before speedometer in flex order. */
export function hudZoneOrder(): readonly string[] {
  return ['header', 'sos', 'sensors', 'speedometer', 'footer'];
}
