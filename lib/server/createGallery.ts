'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {files, galleries, galleryFiles} from '@/db/schema';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';
import {createClient} from '@/lib/supabase/server';
import {parseDateInputForDb} from '@/lib/utils/datetime';
import {FOTOGALLERY_BUCKET} from '@/lib/utils/storage';

export type CreateGalleryResult = CreateActionResult;

export type GalleryFileInput = {
  storagePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
};

async function cleanupStorageFiles(storagePaths: string[]) {
  if (storagePaths.length === 0) return;
  try {
    const supabase = await createClient();
    await supabase.storage.from(FOTOGALLERY_BUCKET).remove(storagePaths);
  } catch {
    // eslint-disable-next-line no-console
    console.error(
      '[createGallery] Best-effort Storage cleanup failed for:',
      storagePaths,
    );
  }
}

export async function createGallery(input: {
  title: string;
  slug: string;
  date: string | null;
  description: string | null;
  files: GalleryFileInput[];
  coverFileIndex: number | null;
}): Promise<CreateGalleryResult> {
  const storagePaths = input.files.map((f) => f.storagePath);

  return runCreateRecordAction({
    actionName: 'createGallery',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit galerii.',
    validate: (raw) => {
      if (!raw.title.trim()) return 'Název je povinný.';
      if (!raw.slug.trim()) return 'Slug je povinný.';
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug.trim())) {
        return 'Slug může obsahovat jen malá písmena, číslice a pomlčky.';
      }
      if (raw.date && !parseDateInputForDb(raw.date)) {
        return 'Neplatné datum.';
      }
      return null;
    },
    executeInsert: async ({input: raw, userId}) => {
      const date = raw.date ? parseDateInputForDb(raw.date) : null;

      try {
        await db.transaction(async (tx) => {
          const [gallery] = await tx
            .insert(galleries)
            .values({
              title: raw.title.trim(),
              slug: raw.slug.trim(),
              date,
              description: raw.description?.trim() || null,
              createdBy: userId,
              updatedBy: userId,
            })
            .returning({id: galleries.id});

          if (raw.files.length > 0) {
            const insertedFiles = await tx
              .insert(files)
              .values(
                raw.files.map((f) => ({
                  storageBucket: FOTOGALLERY_BUCKET,
                  storagePath: f.storagePath,
                  originalName: f.originalName,
                  mimeType: f.mimeType,
                  sizeBytes: f.sizeBytes,
                  width: f.width,
                  height: f.height,
                  createdBy: userId,
                  updatedBy: userId,
                })),
              )
              .returning({id: files.id});

            await tx.insert(galleryFiles).values(
              insertedFiles.map((file, index) => ({
                galleryId: gallery.id,
                fileId: file.id,
                order: index,
              })),
            );

            if (
              raw.coverFileIndex != null &&
              raw.coverFileIndex >= 0 &&
              raw.coverFileIndex < insertedFiles.length
            ) {
              await tx
                .update(galleries)
                .set({coverFileId: insertedFiles[raw.coverFileIndex].id})
                .where(eq(galleries.id, gallery.id));
            }
          }
        });
      } catch (error) {
        await cleanupStorageFiles(storagePaths);
        throw error;
      }
    },
    revalidatePaths: ['/admin/fotogalerie', '/fotogalerie'],
    constraintErrors: [
      {
        includes: 'galleries_slug_uidx',
        message: 'Galerie s tímto slugem již existuje.',
      },
    ],
  });
}
