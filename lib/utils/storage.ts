import {createClient} from '@/lib/supabase/client';
import {sanitizeFileName} from '@/lib/utils/slugify';

export const FOTOGALLERY_BUCKET = 'fotogallery';
export const MERCH_BUCKET = 'merch_products';

/** Maximum file size for gallery photo uploads (in MB). */
export const GALLERY_MAX_FILE_SIZE_MB = 10;
export const GALLERY_MAX_FILE_SIZE_BYTES =
  GALLERY_MAX_FILE_SIZE_MB * 1024 * 1024;

const UNSAFE_PATH_RE = /[/\\]/g;
const TRAVERSAL_SEGMENTS = new Set(['.', '..']);

export function sanitizePathSegment(segment: string): string {
  return segment.replace(UNSAFE_PATH_RE, '_');
}

export function isValidFolderName(folder: string): boolean {
  return (
    folder.length > 0 &&
    !TRAVERSAL_SEGMENTS.has(folder) &&
    !UNSAFE_PATH_RE.test(folder)
  );
}

/**
 * Builds a unique storage path for a gallery photo.
 * Format: `{folder}/{uuid}-{sanitized-name}.{ext}`
 */
export function buildGalleryStoragePath(slug: string, file: File): string {
  const ext = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.'))
    : '';
  const baseName = file.name.includes('.')
    ? file.name.slice(0, file.name.lastIndexOf('.'))
    : file.name;
  const sanitized = sanitizeFileName(baseName);
  const uuid = crypto.randomUUID();
  const folder = slug || 'unsorted';
  return `${folder}/${uuid}-${sanitized}${ext.toLowerCase()}`;
}

export type UploadResult = {success: true} | {success: false; error: string};

/** Uploads a single file to the gallery storage bucket. */
export async function uploadGalleryFile(
  storagePath: string,
  file: File,
): Promise<UploadResult> {
  if (file.size > GALLERY_MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `Soubor je příliš velký. Max. ${GALLERY_MAX_FILE_SIZE_MB} MB.`,
    };
  }

  const supabase = createClient();
  const {error} = await supabase.storage
    .from(FOTOGALLERY_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`[uploadGalleryFile] Upload failed:`, error);
    return {success: false, error: 'Nahrávání fotky selhalo.'};
  }
  return {success: true};
}

/** Best-effort removal of already-uploaded files (e.g. after a mid-upload failure). */
export async function cleanupGalleryFiles(storagePaths: string[]) {
  if (storagePaths.length === 0) return;
  try {
    const supabase = createClient();
    await supabase.storage.from(FOTOGALLERY_BUCKET).remove(storagePaths);
  } catch {
    // best-effort — orphans can be cleaned up later
  }
}
