export type SafetyBriefArticle = {
  slug: string;
  title: string;
  paragraphs: string[];
  issuedAt: string;
};

const BRIEFS: Record<string, SafetyBriefArticle> = {
  'protocol-alpha': {
    slug: 'protocol-alpha',
    title: 'Safety Protocol Alpha',
    issuedAt: 'Issued by MoRTH corridor safety desk',
    paragraphs: [
      'New AI-assisted fatigue detection guidelines are now deployed for commercial drivers operating on national highways and state expressways.',
      'Drivers should take a mandatory rest break every 4 hours or 250 km, whichever comes first. Fleet operators must log rest compliance in the institutional journey record.',
      'NovaDrive surfaces fatigue-risk segments on your corridor map when telemetry is active. If you feel drowsy, use the nearest trauma-ready facility listed in Trip planning or activate Quick SOS.',
      'This protocol is informational and does not replace operator-specific duty rules or medical advice.',
    ],
  },
  'regional-alert': {
    slug: 'regional-alert',
    title: 'Regional Alert',
    issuedAt: 'Active for Tamil Nadu NH corridors',
    paragraphs: [
      'Emergency lanes are now active on NH-45 (GST Road) for fast-track ambulance and highway patrol response.',
      'Do not drive or stop in the marked emergency lane except when directed by highway authorities or during a genuine breakdown with hazard lamps on.',
      'Expect intermittent patrol checkpoints near urban merges. Keep Golden Hour Packet and medical ID accessible via Bystander QR.',
      'Report obstructions or damaged signage through Report Hazard on the home dashboard so fellow citizens receive updated corridor briefings.',
    ],
  },
};

export function getBriefBySlug(slug: string): SafetyBriefArticle | null {
  return BRIEFS[slug] ?? null;
}
