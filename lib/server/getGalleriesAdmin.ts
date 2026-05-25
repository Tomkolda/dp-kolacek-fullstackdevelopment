import {asc, count, desc, eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {files, galleries, galleryFiles} from '@/db/schema';
import type {DBGallery} from '@/db/types';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export type AdminGallery = DBGallery & {
  photoCount: number;
  coverImageUrl: string | null;
};

/**
 * Fetches all galleries for admin purposes, including archived ones,
 * together with cover image URL and the number of linked photos.
 */
export async function getGalleriesAdmin(): Promise<AdminGallery[]> {
  try {
    const [rows, counts] = await Promise.all([
      db
        .select({
          gallery: galleries,
          storageBucket: files.storageBucket,
          storagePath: files.storagePath,
        })
        .from(galleries)
        .leftJoin(files, eq(galleries.coverFileId, files.id))
        .orderBy(
          desc(galleries.date),
          asc(galleries.order),
          asc(galleries.title),
        ),

      db
        .select({
          galleryId: galleryFiles.galleryId,
          photoCount: count(galleryFiles.id),
        })
        .from(galleryFiles)
        .groupBy(galleryFiles.galleryId),
    ]);

    const countMap = new Map(counts.map((c) => [c.galleryId, c.photoCount]));

    return rows.map((row) => ({
      ...row.gallery,
      photoCount: countMap.get(row.gallery.id) ?? 0,
      coverImageUrl:
        row.storageBucket && row.storagePath
          ? getImageUrl(row.storageBucket, row.storagePath)
          : null,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getGalleriesAdmin] Failed to fetch galleries:', error);
    return [];
  }
}
