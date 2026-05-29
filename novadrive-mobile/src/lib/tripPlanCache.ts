import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BriefingCard } from './tripBriefing';

export const TRIP_PLAN_CACHE_KEY = 'nd_last_trip_plan';

export interface CachedTripPlan {
  originLabel: string;
  destinationLabel: string;
  routeId: string;
  routeName: string;
  savedAt: string;
  briefingSnapshot: BriefingCard[];
}

export async function saveTripPlanCache(plan: CachedTripPlan): Promise<void> {
  await AsyncStorage.setItem(TRIP_PLAN_CACHE_KEY, JSON.stringify(plan));
}

export async function loadTripPlanCache(): Promise<CachedTripPlan | null> {
  const raw = await AsyncStorage.getItem(TRIP_PLAN_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedTripPlan;
  } catch {
    return null;
  }
}

export async function clearTripPlanCache(): Promise<void> {
  await AsyncStorage.removeItem(TRIP_PLAN_CACHE_KEY);
}
