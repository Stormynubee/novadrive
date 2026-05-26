export const WOMENS_HELPLINE = '181';
export const WOMENS_DISTRESS = '1091';
export const UNIFIED_EMERGENCY = '112';
export const POLICE = '100';

export const NAARI_HELPLINES = [
  { id: 'womens', label: "Women's Helpline", phone: WOMENS_HELPLINE },
  { id: 'distress', label: "Women's Distress", phone: WOMENS_DISTRESS },
  { id: 'unified', label: 'Unified Emergency', phone: UNIFIED_EMERGENCY },
  { id: 'police', label: 'Police', phone: POLICE },
] as const;
