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

export type IncidentType = 'road_accident' | 'natural_calamity' | 'human_crime';

export interface EmergencySession {
  location?: LocationFix;
  incidentType?: IncidentType;
  triage?: TriageColor;
  facility?: Facility;
  packet?: GoldenHourPacket;
}

export type Lang = 'en' | 'hi' | 'ta';

export type JourneyStatus = 'IDLE' | 'ACTIVE' | 'ENDED';

/** Primary ICE contact — family / trusted person for Golden Hour Packet. */
export interface EmergencyContact {
  fullName: string;
  relationship: string;
  phone: string;
}

export interface MedicalProfile {
  bloodType?: string;
  allergies?: string;
  conditions?: string;
  medications?: string;
  /** @deprecated migrated to primaryContact — kept for SMS back-compat */
  emergencyContact?: string;
  primaryContact?: EmergencyContact;
}

export interface AccessibilityPrefs {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  /** Spoken cues during emergency triage */
  ttsEnabled: boolean;
  fontScale?: number;
  /** Hands-free safety commands + voice watch during drive */
  voiceCommand: boolean;
  /** Strong vibration on crash / panic detection */
  hapticCrashAlerts: boolean;
  /** TalkBack-style announcements for UI changes */
  screenReader: boolean;
  /** Turn-by-turn / corridor spoken updates */
  audioNavigation: boolean;
}

export type SosSensitivity = 'low' | 'medium' | 'high';

export type VoiceDistressSensitivity = 'low' | 'medium' | 'high';

export type GenderIdentity = 'female' | 'male' | 'other' | 'prefer_not_to_say';

export interface NaariShaktiPrefs {
  enabled: boolean;
  safetyModeActive: boolean;
  /** ISO timestamp of last protocol modal dismiss without enable */
  protocolDismissedAt?: string;
}

export interface AppSettings {
  language: Lang;
  regionalProtocols: boolean;
  biometricAuth: boolean;
  sosSensitivity: SosSensitivity;
  telemetrySharing: boolean;
  autoDispatchMedical: boolean;
  notifyEmergencyContacts: boolean;
  lockDeviceScreen: boolean;
  /** Listen for distress audio during an active journey only */
  voiceCrashDetection: boolean;
  /** Scream/distress voice detection strictness */
  voiceDistressSensitivity: VoiceDistressSensitivity;
}

export interface UserProfile {
  mode: 'guest' | 'auth';
  name?: string;
  email?: string;
  citizenId?: string;
  avatarUri?: string;
  gender?: GenderIdentity;
  naariShakti?: NaariShaktiPrefs;
  medical?: MedicalProfile;
  a11y?: AccessibilityPrefs;
  settings?: AppSettings;
}
