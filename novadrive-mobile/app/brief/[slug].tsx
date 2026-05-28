import { useLocalSearchParams } from 'expo-router';
import { SafetyBriefExperienceScreen } from '../../src/components/home/SafetyBriefExperienceScreen';

export default function SafetyBriefDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const resolved = typeof slug === 'string' ? slug : '';
  return <SafetyBriefExperienceScreen slug={resolved} />;
}
