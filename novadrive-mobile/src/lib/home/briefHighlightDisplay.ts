export type BriefHighlight = {
  label: string;
  value: string;
  compactLabel?: string;
  compactValue?: string;
};

export function resolveBriefHighlightDisplay(highlight: BriefHighlight): {
  label: string;
  value: string;
} {
  const label = highlight.compactLabel ?? highlight.label;
  const value = highlight.compactValue ?? highlight.value;
  return {
    label: label.toUpperCase(),
    value,
  };
}
