import { getSafetyBriefDetail } from './safetyBriefExperience';

export type SafetyBriefArticle = {
  slug: string;
  title: string;
  paragraphs: string[];
  issuedAt: string;
};

export function getBriefBySlug(slug: string): SafetyBriefArticle | null {
  const detail = getSafetyBriefDetail(slug);
  if (!detail) return null;
  return {
    slug: detail.slug,
    title: detail.title,
    paragraphs: detail.paragraphs,
    issuedAt: detail.issuedAt,
  };
}
