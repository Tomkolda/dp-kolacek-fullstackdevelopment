'use server';

import {createClient} from '@/lib/supabase/server';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export type StorageImageFile = {
  /** File name (used as the stored value in DB). */
  name: string;
  /** Full public URL for display / preview. */
  url: string;
};

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
  '.svg',
]);

export async function getStorageImages(
  bucket: string,
): Promise<StorageImageFile[]> {
  const supabase = await createClient();

  const {data, error} = await supabase.storage.from(bucket).list('', {
    sortBy: {column: 'name', order: 'asc'},
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[getStorageImages] Failed to list images in "${bucket}":`,
      error,
    );
    return [];
  }

  return (data ?? [])
    .filter((file: {name: string}) => {
      if (!file.name) return false;
      // Skip Supabase empty folder placeholders
      if (file.name === '.emptyFolderPlaceholder') return false;
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    })
    .map((file: {name: string}) => ({
      name: file.name,
      url: getImageUrl(bucket, file.name),
    }));
}
