import { TextStyle, ViewStyle } from 'react-native';
import { tokens } from '../theme/tokens';

/** Sublabel below HOLD FOR SOS — must not use absolute positioning (overlaps on narrow screens). */
export const holdSosHudTopSublabelStyle: TextStyle = {
  color: 'rgba(255,255,255,0.85)',
  fontSize: 10,
  letterSpacing: 1.2,
  textAlign: 'center',
};

export const holdSosHudTopInnerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  zIndex: 1,
  paddingHorizontal: 16,
};

export const holdSosHudTopTextColumnStyle: ViewStyle = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 2,
};

export function holdSosHudTopSublabelCopy(holding: boolean): string {
  return holding ? 'Hold steady…' : 'Hold 3 seconds';
}

export function holdSosHudTopUsesAbsoluteSublabel(): boolean {
  return 'position' in holdSosHudTopSublabelStyle && holdSosHudTopSublabelStyle.position === 'absolute';
}

export const holdSosHudTopHeadlineColor = tokens.onError;
