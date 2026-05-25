import { StyleSheet } from 'react-native';
import { tokens } from './tokens';

export const variants = StyleSheet.create({
  card: {
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  cardInset: {
    backgroundColor: tokens.surfaceContainerLow,
    borderRadius: tokens.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  input: {
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.primary,
    borderRadius: tokens.radius.input,
    padding: 14,
    color: tokens.onSurface,
    fontSize: 16,
    fontFamily: 'PublicSans_400Regular',
  },
});
