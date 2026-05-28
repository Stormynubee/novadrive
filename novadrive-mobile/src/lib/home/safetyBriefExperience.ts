import type { SafetyBriefArticle } from './briefCatalog';
import type { BriefHighlight } from './briefHighlightDisplay';

export type BriefSeverity = 'info' | 'advisory' | 'active';

export type BriefChecklistItem = {
  id: string;
  label: string;
};

export type BriefQuickActionId =
  | 'plan-corridor'
  | 'settings-regional'
  | 'share'
  | 'report-hazard';

export type BriefQuickAction = {
  id: BriefQuickActionId;
  label: string;
  icon: 'route' | 'tune' | 'share' | 'warning';
};

export type SafetyBriefDetail = SafetyBriefArticle & {
  referenceCode: string;
  severity: BriefSeverity;
  region: string;
  effectiveUntil: string;
  highlights: BriefHighlight[];
  affectedCorridors: string[];
  checklist: BriefChecklistItem[];
  quickActions: BriefQuickAction[];
  relatedSlug?: string;
};

const DETAILS: Record<string, SafetyBriefDetail> = {
  'protocol-alpha': {
    slug: 'protocol-alpha',
    title: 'Safety Protocol Alpha',
    issuedAt: 'Issued by MoRTH corridor safety desk',
    referenceCode: 'MORTH-PROT-α-2026',
    severity: 'advisory',
    region: 'National highways & expressways',
    effectiveUntil: '31 Dec 2026',
    highlights: [
      { label: 'Rest rule', value: '4 h / 250 km' },
      {
        label: 'Telemetry',
        value: 'Fatigue segments',
        compactValue: 'Fatigue map on',
      },
      {
        label: 'Scope',
        value: 'Commercial drivers',
        compactValue: 'Commercial fleet',
      },
    ],
    affectedCorridors: [],
    paragraphs: [
      'New AI-assisted fatigue detection guidelines are now deployed for commercial drivers operating on national highways and state expressways.',
      'Drivers should take a mandatory rest break every 4 hours or 250 km, whichever comes first. Fleet operators must log rest compliance in the institutional journey record.',
      'NovaDrive surfaces fatigue-risk segments on your corridor map when telemetry is active. If you feel drowsy, use the nearest trauma-ready facility listed in Trip planning or activate Quick SOS.',
      'This protocol is informational and does not replace operator-specific duty rules or medical advice.',
    ],
    checklist: [
      { id: 'rest', label: 'Schedule rest before the 4 h / 250 km threshold' },
      { id: 'telemetry', label: 'Confirm corridor telemetry is active for this trip' },
      { id: 'contacts', label: 'Verify emergency contacts and Golden Hour Packet are current' },
    ],
    quickActions: [
      { id: 'plan-corridor', label: 'Plan corridor', icon: 'route' },
      { id: 'share', label: 'Share protocol', icon: 'share' },
      { id: 'report-hazard', label: 'Report hazard', icon: 'warning' },
    ],
    relatedSlug: 'regional-alert',
  },
  'regional-alert': {
    slug: 'regional-alert',
    title: 'Regional Alert',
    issuedAt: 'Active for Tamil Nadu NH corridors',
    referenceCode: 'TN-NH-ALERT-0426',
    severity: 'active',
    region: 'Tamil Nadu · NH corridors',
    effectiveUntil: 'Until lifted by highway patrol',
    highlights: [
      { label: 'Status', value: 'Lanes active' },
      { label: 'Patrol', value: 'Urban merges' },
      {
        label: 'Compliance',
        value: 'Emergency lane',
        compactLabel: 'Lanes',
        compactValue: 'Emergency only',
      },
    ],
    affectedCorridors: [
      'NH-45 (GST Road)',
      'NH-44 (Bangalore Hwy)',
      'SH-49 (ECR)',
      'Chennai Outer Ring',
    ],
    paragraphs: [
      'Emergency lanes are now active on NH-45 (GST Road) for fast-track ambulance and highway patrol response.',
      'Do not drive or stop in the marked emergency lane except when directed by highway authorities or during a genuine breakdown with hazard lamps on.',
      'Expect intermittent patrol checkpoints near urban merges. Keep Golden Hour Packet and medical ID accessible via Bystander QR.',
      'Report obstructions or damaged signage through Report Hazard on the home dashboard so fellow citizens receive updated corridor briefings.',
    ],
    checklist: [
      { id: 'lane', label: 'Avoid emergency lane except authority-directed use' },
      { id: 'hazards', label: 'Hazard lamps on if stopped for breakdown' },
      { id: 'packet', label: 'Golden Hour Packet and medical ID reachable' },
    ],
    quickActions: [
      { id: 'settings-regional', label: 'Regional settings', icon: 'tune' },
      { id: 'plan-corridor', label: 'Plan corridor', icon: 'route' },
      { id: 'share', label: 'Share alert', icon: 'share' },
      { id: 'report-hazard', label: 'Report hazard', icon: 'warning' },
    ],
    relatedSlug: 'protocol-alpha',
  },
};

export function getSafetyBriefDetail(slug: string): SafetyBriefDetail | null {
  return DETAILS[slug] ?? null;
}

export function toggleChecklistItem(completedIds: string[], itemId: string): string[] {
  if (completedIds.includes(itemId)) {
    return completedIds.filter((id) => id !== itemId);
  }
  return [...completedIds, itemId];
}

export function allChecklistComplete(
  completedIds: string[],
  checklist: BriefChecklistItem[],
): boolean {
  if (checklist.length === 0) return true;
  return checklist.every((item) => completedIds.includes(item.id));
}

export function toggleProtocolAcknowledgment(
  acknowledgedSlugs: string[],
  slug: string,
): string[] {
  if (acknowledgedSlugs.includes(slug)) {
    return acknowledgedSlugs.filter((s) => s !== slug);
  }
  return [...acknowledgedSlugs, slug];
}

export function buildBriefShareMessage(brief: SafetyBriefDetail): string {
  const corridorLine =
    brief.affectedCorridors.length > 0
      ? `\nCorridors: ${brief.affectedCorridors.join(', ')}`
      : '';
  return [
    `${brief.title} (${brief.referenceCode})`,
    brief.region,
    brief.paragraphs[0],
    corridorLine,
    '— NovaDrive Safety Brief',
  ]
    .filter(Boolean)
    .join('\n');
}

export type BriefQuickActionRoute =
  | { type: 'href'; href: string }
  | { type: 'share' }
  | { type: 'settings-highlight'; settingKey: 'regionalProtocols' };

export function resolveBriefQuickAction(actionId: BriefQuickActionId): BriefQuickActionRoute {
  switch (actionId) {
    case 'plan-corridor':
      return { type: 'href', href: '/(tabs)/drive' };
    case 'settings-regional':
      return { type: 'settings-highlight', settingKey: 'regionalProtocols' };
    case 'share':
      return { type: 'share' };
    case 'report-hazard':
      return { type: 'href', href: '/journey/feedback?hazard=1' };
    default:
      return { type: 'href', href: '/' };
  }
}

export function severityLabel(severity: BriefSeverity): string {
  switch (severity) {
    case 'active':
      return 'ACTIVE';
    case 'advisory':
      return 'ADVISORY';
    default:
      return 'INFO';
  }
}
