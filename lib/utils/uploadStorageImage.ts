import {createClient} from '@/lib/supabase/client';
import {isValidFolderName, sanitizePathSegment} from '@/lib/utils/storage';

export type UploadStorageImageResult =
  | {success: true; fileName: string}
  | {success: false; error: string};

export const IMAGE_ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]);

export const IMAGE_ACCEPT_STRING = Array.from(IMAGE_ALLOWED_TYPES).join(',');

const MAX_SIZE_MB = 5;

export async function uploadStorageImage(
  bucket: string,
  file: File,
  folder?: string,
): Promise<UploadStorageImageResult> {
  if (folder !== undefined && !isValidFolderName(folder)) {
    return {success: false, error: 'Neplatný název složky.'};
  }

  if (!IMAGE_ALLOWED_TYPES.has(file.type)) {
    return {
      success: false,
      error: 'Nepodporovaný formát. Povolené: JPG, PNG, GIF, WebP, AVIF, SVG.',
    };
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return {
      success: false,
      error: `Soubor je příliš velký. Max. ${MAX_SIZE_MB} MB.`,
    };
  }

  const fileName = sanitizePathSegment(file.name);
  const storagePath = folder ? `${folder}/${fileName}` : fileName;

  const supabase = createClient();

  const {error} = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`[uploadStorageImage] Upload to "${bucket}" failed:`, error);
    return {success: false, error: 'Nahrávání obrázku selhalo.'};
  }

  return {success: true, fileName};
}
