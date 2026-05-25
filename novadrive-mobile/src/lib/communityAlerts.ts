import type { FeedbackCategory } from './journeyDb';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface CommunityAlert {
  id: string;
  title: string;
  body: string;
  ago: string;
  severity: AlertSeverity;
  icon: 'flood' | 'construction' | 'traffic';
  verified?: boolean;
}

export interface SafetyPioneer {
  rank: number;
  name: string;
  score: number;
  verified?: boolean;
}

export const SEED_ALERTS: CommunityAlert[] = [
  {
    id: 'alert-flood',
    title: 'Severe Waterlogging',
    body: 'Heavy accumulation on Outer Ring Road near Sector 4 junction. Multiple vehicle stalls reported. Proceed with extreme caution or divert.',
    ago: '10 mins ago',
    severity: 'critical',
    icon: 'flood',
    verified: true,
  },
  {
    id: 'alert-roadworks',
    title: 'Unplanned Roadworks',
    body: 'Single lane closure on NH-44 southbound stretch near Metro Pillar 112. Expect minor delays.',
    ago: '1 hr ago',
    severity: 'warning',
    icon: 'construction',
  },
  {
    id: 'alert-traffic',
    title: 'Traffic Normalizing',
    body: 'Previous congestion cleared at City Center intersection. Flow restored to standard operational capacity.',
    ago: '2 hrs ago',
    severity: 'info',
    icon: 'traffic',
  },
];

export const SEED_PIONEERS: SafetyPioneer[] = [
  { rank: 1, name: 'Rajiv M.', score: 98.5, verified: true },
  { rank: 2, name: 'Priya S.', score: 97.2 },
  { rank: 3, name: 'Amit K.', score: 96.8 },
];

export const OFFICIAL_REPORT_OPTIONS: {
  label: string;
  category: FeedbackCategory;
  rating: number;
}[] = [
  { label: 'False Positive Alert (AI Error)', category: 'app', rating: 2 },
  { label: 'UI/UX Improvement Suggestion', category: 'app', rating: 4 },
  { label: 'Mapping Inaccuracy', category: 'road', rating: 2 },
  { label: 'Other Technical Issue', category: 'other', rating: 3 },
];
