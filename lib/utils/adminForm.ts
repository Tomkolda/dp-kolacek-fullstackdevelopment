import {isHttpUrl} from '@/lib/utils/url';

export function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function asOptionalString(value: unknown): string | undefined {
  const normalized = asString(value).trim();
  return normalized || undefined;
}

export function asOptionalTime(value: unknown): string | undefined {
  const time = asOptionalString(value);
  if (!time) return undefined;
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time.slice(0, 5);
  return time;
}

export function asOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === undefined || value === null) return undefined;
  return Number(value);
}

export function createRequiredTextValidator(message: string) {
  return (value: unknown): string | null =>
    asOptionalString(value) ? null : message;
}

export function createOptionalHttpUrlValidator(message: string) {
  return (value: unknown): string | null => {
    const link = asOptionalString(value);
    if (!link) return null;
    return isHttpUrl(link) ? null : message;
  };
}
