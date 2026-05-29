import { tokens } from './tokens';

test('Care Path primary blue', () => {
  expect(tokens.primary).toBe('#0056b3');
});

test('Care Path accent orange', () => {
  expect(tokens.secondary).toBe('#ff8c00');
});

test('light background', () => {
  expect(tokens.background).toBe('#f8f9fb');
  expect(tokens.surface).toBe('#ffffff');
});
