'use server';

import {db} from '@/db/client';
import {albums, type AlbumTrack} from '@/db/schema';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';
import {parseDateInputForDb} from '@/lib/utils/datetime';

export type CreateAlbumResult = CreateActionResult;

export async function createAlbum(input: {
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
}): Promise<CreateAlbumResult> {
  return runCreateRecordAction({
    actionName: 'createAlbum',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit album.',
    executeInsert: async ({input: raw, userId}) => {
      const releaseDate = parseDateInputForDb(raw.releaseDate);
      if (!releaseDate) throw new Error('Invalid release date');

      await db.insert(albums).values({
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
        createdBy: userId,
        updatedBy: userId,
      });
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
