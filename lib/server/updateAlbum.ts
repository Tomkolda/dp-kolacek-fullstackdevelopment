'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {albums, type AlbumTrack} from '@/db/schema';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';
import {parseDateInputForDb} from '@/lib/utils/datetime';

export type UpdateAlbumResult = UpdateActionResult;

export async function updateAlbum(
  id: number,
  input: {
    title: string;
    releaseDate: string;
    description: string | null;
    genre: string | null;
    label: string | null;
    coverImage: string | null;
    producedBy: string | null;
    mixedBy: string | null;
    recordedBy: string | null;
    youtubeLink: string | null;
    spotifyLink: string | null;
    appleMusicLink: string | null;
    tidalLink: string | null;
    tracks: AlbumTrack[];
  },
): Promise<UpdateAlbumResult> {
  return runUpdateRecordAction({
    actionName: 'updateAlbum',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit album.',
    notFoundErrorMessage: 'Album nebylo nalezeno.',
    executeUpdate: async ({id: albumId, input: raw, userId}) => {
      const releaseDate = parseDateInputForDb(raw.releaseDate);
      if (!releaseDate) throw new Error('Invalid release date');

      const updatedRows = await db
        .update(albums)
        .set({
          title: raw.title.trim(),
          releaseDate,
          description: raw.description?.trim() || null,
          genre: raw.genre?.trim() || null,
          label: raw.label?.trim() || null,
          coverImage: raw.coverImage?.trim() || null,
          producedBy: raw.producedBy?.trim() || null,
          mixedBy: raw.mixedBy?.trim() || null,
          recordedBy: raw.recordedBy?.trim() || null,
          youtubeLink: raw.youtubeLink?.trim() || null,
          spotifyLink: raw.spotifyLink?.trim() || null,
          appleMusicLink: raw.appleMusicLink?.trim() || null,
          tidalLink: raw.tidalLink?.trim() || null,
          tracks: raw.tracks.length > 0 ? raw.tracks : null,
          updatedBy: userId,
        })
        .returning({id: albums.id})
        .where(eq(albums.id, albumId));

      return updatedRows.length;
    },
    revalidatePaths: ['/admin/diskografie', '/diskografie'],
    constraintErrors: [
      {
        includes: 'albums_title_release_date_uidx',
        message: 'Album se stejným názvem a datem vydání již existuje.',
      },
    ],
  });
}
