const INVALID_PROFILE_LINK_MESSAGE =
  'Zadej interní redirect cestu, např. /spotify';

function hasUnsafeScheme(value: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(value);
}

export function normalizeProfileLink(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function validateProfileLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Odkaz je povinný';
  if (trimmed.includes(' ') || /\s/.test(trimmed)) {
    return 'Odkaz nesmí obsahovat mezery';
  }
  if (
    trimmed.startsWith('//') ||
    trimmed.includes('://') ||
    hasUnsafeScheme(trimmed)
  ) {
    return INVALID_PROFILE_LINK_MESSAGE;
  }
  return null;
}
