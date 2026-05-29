import {
  APP_DISPLAY_NAME,
  APP_TAGLINE,
  GHP_HASH_PREFIX,
  GHP_SMS_HEADER,
  LEGACY_GHP_HEADERS,
  TEAM_DISPLAY_NAME,
  permissionCopy,
} from './brand';

test('display name is Margi', () => {
  expect(APP_DISPLAY_NAME).toBe('Margi');
});

test('team display name is Team NovaDrive', () => {
  expect(TEAM_DISPLAY_NAME).toBe('Team NovaDrive');
});

test('tagline is set', () => {
  expect(APP_TAGLINE).toContain('path');
});

test('GHP SMS header uses Margi', () => {
  expect(GHP_SMS_HEADER).toBe('MARGI GHP');
});

test('hash prefix is mg', () => {
  expect(GHP_HASH_PREFIX).toBe('mg');
});

test('legacy GHP headers include NovaDrive', () => {
  expect(LEGACY_GHP_HEADERS).toContain('NOVADRIVE GHP');
});

test('location permission mentions Margi', () => {
  expect(permissionCopy.locationWhenInUse()).toContain('Margi');
});

test('camera permission mentions Margi', () => {
  expect(permissionCopy.camera()).toContain('Margi');
});

test('microphone permission mentions Margi', () => {
  expect(permissionCopy.microphone()).toContain('Margi');
});
