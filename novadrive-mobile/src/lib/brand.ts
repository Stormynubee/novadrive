/** Single source for Margi product identity strings. */

export const APP_DISPLAY_NAME = 'Margi';

export const APP_TAGLINE = 'When signal drops, the path still holds.';

export const GHP_SMS_HEADER = 'MARGI GHP';

export const GHP_HASH_PREFIX = 'mg';

export const LEGACY_GHP_HEADERS = ['NOVADRIVE GHP'] as const;

export const permissionCopy = {
  locationWhenInUse: () =>
    'Margi uses your location during an active journey to route emergencies and build the Golden Hour Packet.',
  camera: () => 'Margi uses the camera to scan bystander relay QR codes.',
  microphone: () =>
    'Margi records short emergency audio during Naari Shakti distress activation and may listen for distress sounds during an active journey.',
  photoLibrary: () => 'Margi uses your photo library so you can choose a profile picture.',
};
