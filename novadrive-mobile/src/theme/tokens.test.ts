import { tokens } from './tokens';

test('Deep Navy primary chrome', () => {
  expect(tokens.primary).toBe('#000a1e');
  expect(tokens.primaryDeep).toBe('#000714');
});

test('Emergency Saffron accent', () => {
  expect(tokens.secondary).toBe('#fe6b00');
  expect(tokens.secondaryDeep).toBe('#a04100');
});

test('light background', () => {
  expect(tokens.background).toBe('#f8f9fb');
  expect(tokens.surface).toBe('#ffffff');
});

test('Stitch ink onSurface', () => {
  expect(tokens.onSurface).toBe('#191c1d');
});
