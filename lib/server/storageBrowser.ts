'use server';

import {and, eq, inArray} from 'drizzle-orm';

import {db} from '@/db/client';
import {files, galleryFiles} from '@/db/schema';
import {getUser} from '@/lib/server/getUser';
import {createClient} from '@/lib/supabase/server';
import {getImageUrl} from '@/lib/utils/getImageUrl';
import {FOTOGALLERY_BUCKET} from '@/lib/utils/storage';

export type StorageFolder = {
  name: string;
};

export type StorageFile = {
  name: string;
  url: string;
  caption: string | null;
};

const IGNORED_NAMES = new Set(['.emptyFolderPlaceholder']);

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
  '.svg',
]);

function isImageFile(name: string): boolean {
  const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

/** Lists sub-folders inside the fotogallery bucket. */
export async function listStorageFolders(
  path: string = '',
): Promise<StorageFolder[]> {
  const {user, error: authError} = await getUser();
  if (authError || !user) return [];

  const supabase = await createClient();

  const {data, error} = await supabase.storage
    .from(FOTOGALLERY_BUCKET)
    .list(path, {
      sortBy: {column: 'name', order: 'asc'},
    });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[listStorageFolders] Failed:', error);
    return [];
  }

  return (data ?? [])
    .filter((item) => item.id === null && !IGNORED_NAMES.has(item.name))
    .map((item) => ({name: item.name}));
}

/** Lists image files inside a fotogallery bucket path. */
export async function listStorageFiles(path: string): Promise<StorageFile[]> {
  const {user, error: authError} = await getUser();
  if (authError || !user) return [];

  const supabase = await createClient();

  const {data, error} = await supabase.storage
    .from(FOTOGALLERY_BUCKET)
    .list(path, {
      sortBy: {column: 'name', order: 'asc'},
    });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[listStorageFiles] Failed:', error);
    return [];
  }

  const imageItems = (data ?? []).filter(
    (item) =>
      item.id !== null &&
      !IGNORED_NAMES.has(item.name) &&
      isImageFile(item.name),
  );

  const captionMap = new Map<string, string | null>();
  if (path && imageItems.length > 0) {
    const storagePaths = imageItems.map((item) => `${path}/${item.name}`);
    try {
      const rows = await db
        .select({
          storagePath: files.storagePath,
          caption: galleryFiles.caption,
        })
        .from(galleryFiles)
        .innerJoin(files, eq(galleryFiles.fileId, files.id))
        .where(
          and(
            eq(files.storageBucket, FOTOGALLERY_BUCKET),
            inArray(files.storagePath, storagePaths),
          ),
        );

      for (const row of rows) {
        const fileName = row.storagePath.split('/').pop();
        if (fileName) {
          captionMap.set(fileName, row.caption);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[listStorageFiles] Failed to fetch captions:', e);
    }
  }

  return imageItems.map((item) => ({
    name: item.name,
    url: getImageUrl(
      FOTOGALLERY_BUCKET,
      path ? `${path}/${item.name}` : item.name,
    ),
    caption: captionMap.get(item.name) ?? null,
  }));
}
