import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MargiInput } from './MargiInput';
import { MargiButton } from './MargiButton';
import { HudCard } from './HudCard';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

export function CollapsibleChat({
  value,
  onChangeText,
  onSend,
  appliedTags,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  appliedTags?: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <HudCard variant="inset">
      <Pressable onPress={() => setOpen(!open)} style={styles.header}>
        <HudText variant="bodySm" style={styles.label}>
          Describe in your own words (optional)
        </HudText>
        <MaterialIcons
          name={open ? 'expand-less' : 'expand-more'}
          size={22}
          color={tokens.primary}
        />
      </Pressable>
      {open ? (
        <View style={styles.body}>
          <MargiInput
            multiline
            placeholder='e.g. "not breathing, cannot walk"'
            value={value}
            onChangeText={onChangeText}
          />
          <MargiButton label="Send" onPress={onSend} variant="ghost" />
          {appliedTags?.map((t) => (
            <HudText key={t} variant="mono" style={styles.tag}>
              Applied: {t}
            </HudText>
          ))}
        </View>
      ) : null}
    </HudCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: tokens.primary, fontFamily: 'PublicSans_700Bold', fontSize: 13 },
  body: { marginTop: 12, gap: 10 },
  tag: { color: tokens.tertiary, fontSize: 10 },
});
