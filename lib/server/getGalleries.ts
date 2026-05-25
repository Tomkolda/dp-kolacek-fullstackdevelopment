'use server';

import {and, asc, desc, eq, isNull} from 'drizzle-orm';

import {db} from '@/db/client';
import {files, galleries, galleryFiles} from '@/db/schema';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export type GalleryListItem = {
  id: number;
  title: string;
  slug: string;
  date: string | null;
  coverImageUrl: string | null;
};

export type GalleryPhoto = {
  id: number;
  url: string;
  caption: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type GetGalleryPhotosActionFn = typeof getGalleryPhotos;

/** Fetches all photos for a gallery, ordered by `gallery_files.order`. */
export async function getGalleryPhotos(
  galleryId: number,
): Promise<GalleryPhoto[]> {
  try {
    const rows = await db
      .select({
        id: galleryFiles.id,
        caption: galleryFiles.caption,
        storageBucket: files.storageBucket,
        storagePath: files.storagePath,
        altText: files.altText,
        width: files.width,
        height: files.height,
      })
      .from(galleryFiles)
      .innerJoin(files, eq(galleryFiles.fileId, files.id))
      .innerJoin(
        galleries,
        and(
          eq(galleryFiles.galleryId, galleries.id),
          isNull(galleries.archivedAt),
        ),
      )
      .where(eq(galleryFiles.galleryId, galleryId))
      .orderBy(asc(galleryFiles.order));

    return rows.map((row) => ({
      id: row.id,
      url: getImageUrl(row.storageBucket, row.storagePath),
      caption: row.caption,
      altText: row.altText,
      width: row.width,
      height: row.height,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getGalleryPhotos] Failed to fetch gallery photos:', error);
    return [];
  }
}

export type GalleryMeta = {
  id: number;
  title: string;
  slug: string;
  date: string | null;
};

/** Lightweight lookup by slug — returns only id/title/slug/date, no photos. */
export async function getGalleryMetaBySlug(
  slug: string,
): Promise<GalleryMeta | null> {
  try {
    const [gallery] = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        date: galleries.date,
      })
      .from(galleries)
      .where(and(eq(galleries.slug, slug), isNull(galleries.archivedAt)))
      .limit(1);

    return gallery ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getGalleryMetaBySlug] Failed:', error);
    return null;
  }
}

/** Fetches non-archived galleries sorted by date (newest first, undated last), then order. */
export async function getGalleries(): Promise<GalleryListItem[]> {
  try {
    const rows = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        date: galleries.date,
        storageBucket: files.storageBucket,
        storagePath: files.storagePath,
      })
      .from(galleries)
      .leftJoin(files, eq(galleries.coverFileId, files.id))
      .where(isNull(galleries.archivedAt))
      .orderBy(
        desc(galleries.date),
        asc(galleries.order),
        asc(galleries.title),
      );

    return rows
      .sort((a, b) => {
        if (a.date && b.date) return 0;
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        return -1;
      })
      .map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        date: row.date,
        coverImageUrl:
          row.storageBucket && row.storagePath
            ? getImageUrl(row.storageBucket, row.storagePath)
            : null,
      }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getGalleries] Failed to fetch galleries:', error);
    return [];
  }
}
