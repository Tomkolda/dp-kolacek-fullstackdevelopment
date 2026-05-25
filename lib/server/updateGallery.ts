'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {galleries} from '@/db/schema';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';
import {parseDateInputForDb} from '@/lib/utils/datetime';

export type UpdateGalleryResult = UpdateActionResult;

export async function updateGallery(
  id: number,
  input: {
    title: string;
    date: string | null;
    coverFileId: number | null;
  },
): Promise<UpdateGalleryResult> {
  return runUpdateRecordAction({
    actionName: 'updateGallery',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit galerii.',
    notFoundErrorMessage: 'Galerie nebyla nalezena.',
    validate: (raw) => {
      if (!raw.title.trim()) return 'Název je povinný.';
      if (raw.date && !parseDateInputForDb(raw.date)) {
        return 'Neplatné datum.';
      }
      return null;
    },
    executeUpdate: async ({id: galleryId, input: raw, userId}) => {
      const date = raw.date ? parseDateInputForDb(raw.date) : null;

      const updatedRows = await db
        .update(galleries)
        .set({
          title: raw.title.trim(),
          date,
          coverFileId: raw.coverFileId,
          updatedBy: userId,
        })
        .returning({id: galleries.id})
        .where(eq(galleries.id, galleryId));

      return updatedRows.length;
    },
    revalidatePaths: ['/admin/fotogalerie', '/fotogalerie'],
  });
}
