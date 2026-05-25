/**
 * Returns true only for absolute HTTP(S) URLs.
 * We intentionally reject other schemes (e.g. javascript:, data:, mailto:).
 */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
