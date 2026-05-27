import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';
import type { IncidentType } from '../types';

export type { IncidentType };

export type IncidentIconName = ComponentProps<typeof MaterialIcons>['name'];

export type IncidentAccent = 'primary' | 'secondary' | 'error';

export type IncidentOption = {
  id: IncidentType;
  title: string;
  description: string;
  ctaLabel: string;
  icon: IncidentIconName;
  accent: IncidentAccent;
  priority?: 'high';
};

export const HIGH_PRIORITY_INCIDENT_ID: IncidentType = 'natural_calamity';

export const INCIDENT_OPTIONS: readonly IncidentOption[] = [
  {
    id: 'road_accident',
    title: 'Road Accident',
    description:
      'Standard emergency request for traffic-related collisions and medical support.',
    ctaLabel: 'INITIATE SOS',
    icon: 'minor-crash',
    accent: 'primary',
  },
  {
    id: 'natural_calamity',
    title: 'Natural Calamity',
    description:
      'Alerts trusted contacts, enables live GPS sharing, and starts automatic cloud video recording.',
    ctaLabel: 'ACTIVATE PROTOCOL',
    icon: 'flood',
    accent: 'secondary',
    priority: 'high',
  },
  {
    id: 'human_crime',
    title: 'Human Crime',
    description:
      'Silent intervention protocol for threats, assault, or security breaches requiring police dispatch.',
    ctaLabel: 'URGENT DISPATCH',
    icon: 'security',
    accent: 'error',
  },
] as const;

export function getIncidentOption(id: IncidentType): IncidentOption | undefined {
  return INCIDENT_OPTIONS.find((o) => o.id === id);
}
