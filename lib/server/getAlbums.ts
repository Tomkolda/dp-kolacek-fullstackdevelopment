'use server';

import {and, asc, desc, eq, isNull} from 'drizzle-orm';

import {db} from '@/db/client';
import {type AlbumDetail, albums} from '@/db/schema';

type GetAlbumsOptions = {
  limit?: number;
  ascending?: boolean;
};

export type AlbumListItem = {
  id: number;
  title: string;
  releaseDate: string;
  coverImage: string | null;
  order: number | null;
};

/**
 * Fetches non-archived albums sorted by release date.
 * By default returns newest first.
 */
export async function getAlbums(
  options?: GetAlbumsOptions,
): Promise<AlbumListItem[]> {
  try {
    const sortDirection = options?.ascending
      ? asc(albums.releaseDate)
      : desc(albums.releaseDate);

    const query = db
      .select({
        id: albums.id,
        title: albums.title,
        releaseDate: albums.releaseDate,
        coverImage: albums.coverImage,
        order: albums.order,
      })
      .from(albums)
      .where(isNull(albums.archivedAt))
      .orderBy(sortDirection, asc(albums.order), asc(albums.title));

    return options?.limit ? await query.limit(options.limit) : await query;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getAlbums] Failed to fetch albums:', error);
    return [];
  }
}

/** Fetches a single non-archived album with all detail fields for modal view. */
export async function getAlbumDetailById(
  albumId: number,
): Promise<AlbumDetail | null> {
  try {
    const [album] = await db
      .select({
        id: albums.id,
        title: albums.title,
        releaseDate: albums.releaseDate,
        description: albums.description,
        genre: albums.genre,
        label: albums.label,
        coverImage: albums.coverImage,
        bookletImages: albums.bookletImages,
        producedBy: albums.producedBy,
        mixedBy: albums.mixedBy,
        recordedBy: albums.recordedBy,
        tracks: albums.tracks,
      })
      .from(albums)
      .where(and(eq(albums.id, albumId), isNull(albums.archivedAt)))
      .limit(1);

    return album ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getAlbumDetailById] Failed to fetch album:', error);
    return null;
  }
}

export type GetAlbumDetailActionResult =
  | {
      ok: true;
      album: NonNullable<Awaited<ReturnType<typeof getAlbumDetailById>>>;
    }
  | {ok: false; error: string};

export type GetAlbumDetailActionFn = (
  albumId: number,
) => Promise<GetAlbumDetailActionResult>;

export async function getAlbumDetailAction(
  albumId: number,
): Promise<GetAlbumDetailActionResult> {
  if (!Number.isInteger(albumId) || albumId <= 0) {
    return {ok: false, error: 'Neplatné ID alba.'};
  }

  const album = await getAlbumDetailById(albumId);
  if (!album) {
    return {ok: false, error: 'Detail alba se nepodařilo načíst.'};
  }

  return {ok: true, album};
}
