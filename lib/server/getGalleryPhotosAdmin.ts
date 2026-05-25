'use server';

import {asc, eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {files, galleryFiles} from '@/db/schema';
import {createClient} from '@/lib/supabase/server';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export type AdminGalleryPhoto = {
  fileId: number;
  url: string;
};

/** Fetches all photos for a gallery (including archived), returning file IDs for cover selection. */
export async function getGalleryPhotosAdmin(
  galleryId: number,
): Promise<AdminGalleryPhoto[]> {
  const supabase = await createClient();
  const {data, error: authError} = await supabase.auth.getUser();
  if (authError || !data.user) return [];

  try {
    const rows = await db
      .select({
        fileId: galleryFiles.fileId,
        storageBucket: files.storageBucket,
        storagePath: files.storagePath,
      })
      .from(galleryFiles)
      .innerJoin(files, eq(galleryFiles.fileId, files.id))
      .where(eq(galleryFiles.galleryId, galleryId))
      .orderBy(asc(galleryFiles.order));

    return rows.map((row) => ({
      fileId: row.fileId,
      url: getImageUrl(row.storageBucket, row.storagePath),
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[getGalleryPhotosAdmin] Failed to fetch gallery photos:',
      error,
    );
    return [];
  }
}
