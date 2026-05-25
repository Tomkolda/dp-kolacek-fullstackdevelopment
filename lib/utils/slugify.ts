/**
 * Converts text to a URL-friendly slug.
 * Strips Czech (and other Latin) diacritics via NFD decomposition,
 * lowercases, replaces non-alphanumeric runs with a single hyphen,
 * and trims leading/trailing hyphens.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a gallery slug from title and optional date.
 * Example: ("Letní koncert", "2024-06-15") → "2024-06-15-letni-koncert"
 */
export function generateGallerySlug(title: string, date: string): string {
  const titleSlug = slugify(title);
  if (!titleSlug) return '';

  const trimmedDate = date.trim();
  if (!trimmedDate) return titleSlug;

  return `${trimmedDate}-${titleSlug}`;
}

/**
 * Sanitizes a filename for use in a storage path.
 * Strips diacritics, lowercases, keeps alphanumeric/dot/hyphen,
 * collapses runs of hyphens.
 */
export function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
