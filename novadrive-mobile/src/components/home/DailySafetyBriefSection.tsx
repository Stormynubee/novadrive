import { useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { SafetyBriefCard } from './SafetyBriefCard';
import { useHomeLocationWeather } from '../../hooks/useHomeLocationWeather';
import { tokens } from '../../theme/tokens';

type Props = {
  /** Call when home tab gains focus to refresh location/weather */
  active?: boolean;
};

export function DailySafetyBriefSection({ active = true }: Props) {
  const {
    cityLabel,
    regionLabel,
    tempC,
    summary,
    loading,
    permissionDenied,
    refresh,
  } = useHomeLocationWeather();

  useEffect(() => {
    if (active) {
      void refresh();
    }
  }, [active, refresh]);

  const locationLine =
    regionLabel && !cityLabel.includes(regionLabel) ? `${cityLabel}, ${regionLabel}` : cityLabel;

  const weatherSubtitle = loading
    ? 'Updating local conditions…'
    : permissionDenied
      ? summary
      : tempC != null
        ? `${summary}`
        : summary;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <MaterialIcons name="newspaper" size={24} color={tokens.primary} />
        <HudText variant="headlineMd" style={styles.headerTitle}>
          Daily Safety Brief
        </HudText>
      </View>

      <View style={styles.stack}>
        <SafetyBriefCard
          icon={
            <View style={styles.weatherIconCol}>
              <MaterialIcons name="wb-sunny" size={24} color={tokens.primary} />
              {tempC != null ? (
                <HudText variant="mono" style={styles.temp}>
                  {tempC}°C
                </HudText>
              ) : null}
            </View>
          }
          title={locationLine}
          subtitle={weatherSubtitle}
          onPress={permissionDenied ? () => Linking.openSettings() : undefined}
          accessibilityLabel={
            permissionDenied ? 'Open settings to enable location' : 'Local weather brief'
          }
        />

        <SafetyBriefCard
          icon={
            <View style={[styles.chip, styles.chipTertiary]}>
              <MaterialIcons name="verified" size={20} color={tokens.tertiary} />
            </View>
          }
          title="Safety Protocol Alpha"
          subtitle="New AI fatigue detection guidelines deployed for commercial drivers."
          onPress={() => router.push('/brief/protocol-alpha' as Href)}
        />

        <SafetyBriefCard
          icon={
            <View style={[styles.chip, styles.chipSecondary]}>
              <MaterialIcons name="info" size={20} color={tokens.secondaryDeep} />
            </View>
          }
          title="Regional Alert"
          subtitle="Emergency lanes now active on NH-45 for fast-track response."
          onPress={() => router.push('/brief/regional-alert' as Href)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { width: '100%', zIndex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    color: tokens.primary,
    fontFamily: 'PublicSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  stack: { gap: 8 },
  weatherIconCol: { alignItems: 'center', width: 40, gap: 4 },
  temp: { fontSize: 12, color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  chip: {
    padding: 8,
    borderRadius: tokens.radius.button,
  },
  chipTertiary: { backgroundColor: tokens.tertiaryFixedDim },
  chipSecondary: { backgroundColor: tokens.secondaryFixed },
});
