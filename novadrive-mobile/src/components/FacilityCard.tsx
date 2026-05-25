import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Facility } from '../lib/types';
import { tokens } from '../theme/tokens';

export function FacilityCard({
  facility,
  selected,
  onPress,
}: {
  facility: Facility;
  selected?: boolean;
  onPress: () => void;
}) {
  const warnFar = facility.distanceKm > 150;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        facility.recommended && styles.recommended,
        selected && styles.selected,
      ]}
    >
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="local-hospital" size={20} color={tokens.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{facility.name}</Text>
          <Text style={styles.meta}>
            Tier {facility.traumaTier} · {facility.type} · {facility.distanceKm.toFixed(1)} km · ~
            {facility.etaMinutes} min
          </Text>
        </View>
        {facility.recommended ? <Text style={styles.chip}>Recommended</Text> : null}
      </View>
      <View style={styles.divider} />
      <View style={styles.phoneRow}>
        <MaterialIcons name="call" size={16} color={tokens.tertiary} />
        <Text style={styles.phone}>
          {facility.phone === 'unverified' ? 'Phone unverified' : facility.phone}
        </Text>
        {facility.verified ? (
          <View style={styles.verifiedTag}>
            <MaterialIcons name="verified" size={12} color={tokens.tertiary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}
      </View>
      {warnFar ? (
        <Text style={styles.warn}>Outside offline pack — verify by phone</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    marginBottom: 10,
    ...tokens.elevation.card,
  },
  selected: { borderColor: tokens.primary, borderWidth: 2 },
  recommended: { borderLeftWidth: 4, borderLeftColor: tokens.tertiary },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.iconWrap,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: tokens.primary, fontSize: 16, fontFamily: 'HankenGrotesk_700Bold' },
  chip: {
    color: tokens.onTertiaryContainer,
    backgroundColor: tokens.tertiaryContainer,
    fontSize: 10,
    fontFamily: 'PublicSans_700Bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  meta: {
    color: tokens.onSurfaceVariant,
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'PublicSans_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: tokens.outlineVariant,
    marginVertical: 10,
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phone: { color: tokens.primary, fontSize: 14, fontFamily: 'PublicSans_700Bold', flex: 1 },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: tokens.tertiaryContainer,
    borderRadius: 999,
  },
  verifiedText: {
    color: tokens.onTertiaryContainer,
    fontSize: 10,
    fontFamily: 'PublicSans_700Bold',
  },
  warn: { color: tokens.error, fontSize: 12, marginTop: 8, fontFamily: 'PublicSans_700Bold' },
});
