export type TriageColor = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export type TriageState =
  | 'AMBULATORY'
  | 'BREATHING_CHECK'
  | 'AIRWAY_REPOSITION'
  | 'RESPIRATORY_RATE'
  | 'PERFUSION_CHECK'
  | 'MENTAL_STATUS'
  | 'TAGGED';

export interface LocationFix {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  landmark?: string;
  nhCode?: string;
  nhKm?: number;
  capturedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'trauma' | 'hospital' | 'clinic';
  traumaTier: 1 | 2 | 3;
  phone: string;
  distanceKm: number;
  etaMinutes: number;
  recommended?: boolean;
  verified?: boolean;
}

export interface GoldenHourPacket {
  id: string;
  createdAt: string;
  triage: TriageColor;
  location: LocationFix;
  victims: {
    count: number;
    canWalk: boolean;
    breathing: boolean;
    severeBleeding: boolean;
    capillaryRefillOk: boolean;
    followsCommands: boolean;
  };
  routing: {
    facilityName: string;
    facilityType: Facility['type'];
    phone: string;
    etaMinutes: number;
    distanceKm: number;
  };
  emergency: { dial: string; state: string; language: 'en' | 'hi' | 'ta' };
  integrity: string;
}

export interface EmergencySession {
  location?: LocationFix;
  triage?: TriageColor;
  facility?: Facility;
  packet?: GoldenHourPacket;
}

export type Lang = 'en' | 'hi' | 'ta';

export type JourneyStatus = 'IDLE' | 'ACTIVE' | 'ENDED';

export interface MedicalProfile {
  bloodType?: string;
  allergies?: string;
  conditions?: string;
  emergencyContact?: string;
}

export interface AccessibilityPrefs {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  ttsEnabled: boolean;
}

export interface UserProfile {
  mode: 'guest' | 'auth';
  name?: string;
  medical?: MedicalProfile;
  a11y?: AccessibilityPrefs;
}
