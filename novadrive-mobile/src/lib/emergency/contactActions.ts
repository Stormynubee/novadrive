function normalizePhone(phone: string): string {
  return phone.trim();
}

function isUnavailable(phone: string): boolean {
  const normalized = normalizePhone(phone).toLowerCase();
  return normalized.length === 0 || normalized === 'n/a' || normalized === 'na';
}

export function toDialUrl(phone: string): string | null {
  if (isUnavailable(phone)) return null;
  return `tel:${normalizePhone(phone)}`;
}

export function toSmsUrl(phone: string): string | null {
  if (isUnavailable(phone)) return null;
  return `sms:${normalizePhone(phone)}`;
}
