'use server';

import {and, eq, max} from 'drizzle-orm';

import {db} from '@/db/client';
import {files, galleries, galleryFiles} from '@/db/schema';
import {
  registerStorageFile,
  type StorageFileMetadata,
} from '@/lib/server/registerStorageFile';
import {createClient} from '@/lib/supabase/server';
import {
  FOTOGALLERY_BUCKET,
  isValidFolderName,
  sanitizePathSegment,
} from '@/lib/utils/storage';

export type GalleryFileMetadata = StorageFileMetadata & {
  fileName: string;
};

type RegisterResult =
  | {success: true; registered: number}
  | {success: false; error: string};

/**
 * Registers uploaded files in the `files` table and links them to the
 * matching gallery (by slug = folder name) via `gallery_files`.
 */
export async function registerGalleryFiles(
  folder: string,
  filesMeta: GalleryFileMetadata[],
): Promise<RegisterResult> {
  if (!isValidFolderName(folder)) {
    return {success: false, error: 'Neplatný název složky.'};
  }

  const supabase = await createClient();
  const {data, error: authError} = await supabase.auth.getUser();
  if (authError || !data.user) {
    return {success: false, error: 'Nepřihlášený uživatel.'};
  }

  const userId = data.user.id;

  try {
    const [gallery] = await db
      .select({id: galleries.id})
      .from(galleries)
      .where(eq(galleries.slug, folder))
      .limit(1);

    if (!gallery) {
      return {
        success: false,
        error: 'Galerie pro zadanou složku nebyla nalezena.',
      };
    }

    let registered = 0;

    const [{maxOrder}] = await db
      .select({maxOrder: max(galleryFiles.order)})
      .from(galleryFiles)
      .where(eq(galleryFiles.galleryId, gallery.id));
    let nextOrder = (maxOrder ?? 0) + 1;

    const failed: string[] = [];

    for (const meta of filesMeta) {
      const safeName = sanitizePathSegment(meta.fileName);
      const storagePath = `${folder}/${safeName}`;

      const result = await registerStorageFile(
        FOTOGALLERY_BUCKET,
        storagePath,
        userId,
        {
          mimeType: meta.mimeType,
          sizeBytes: meta.sizeBytes,
          width: meta.width,
          height: meta.height,
        },
      );

      if (result.success) {
        await db
          .insert(galleryFiles)
          .values({
            galleryId: gallery.id,
            fileId: result.fileId,
            order: nextOrder++,
          })
          .onConflictDoNothing();

        registered++;
      } else {
        failed.push(meta.fileName);
      }
    }

    if (failed.length > 0 && registered === 0) {
      return {
        success: false,
        error: `Nepodařilo se zaregistrovat žádný soubor.`,
      };
    }

    if (failed.length > 0) {
      return {
        success: false,
        error: `Nepodařilo se zaregistrovat ${failed.length} z ${filesMeta.length} souborů.`,
      };
    }

    return {success: true, registered};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[registerGalleryFiles] Failed:', error);
    return {success: false, error: 'Registrace souborů do DB selhala.'};
  }
}

type UpdateCaptionResult = {success: true} | {success: false; error: string};

/**
 * Updates the caption of a photo in a gallery, identified by folder (slug) and file name.
 */
export async function updatePhotoCaption(
  folder: string,
  fileName: string,
  caption: string,
): Promise<UpdateCaptionResult> {
  if (!isValidFolderName(folder)) {
    return {success: false, error: 'Neplatný název složky.'};
  }

  const supabase = await createClient();
  const {data, error: authError} = await supabase.auth.getUser();
  if (authError || !data.user) {
    return {success: false, error: 'Nepřihlášený uživatel.'};
  }

  const safeName = sanitizePathSegment(fileName);
  const storagePath = `${folder}/${safeName}`;

  try {
    const [file] = await db
      .select({id: files.id})
      .from(files)
      .where(
        and(
          eq(files.storageBucket, FOTOGALLERY_BUCKET),
          eq(files.storagePath, storagePath),
        ),
      )
      .limit(1);

    if (!file) {
      return {success: false, error: 'Soubor nebyl nalezen v databázi.'};
    }

    const [gallery] = await db
      .select({id: galleries.id})
      .from(galleries)
      .where(eq(galleries.slug, folder))
      .limit(1);

    if (!gallery) {
      return {success: false, error: 'Galerie nebyla nalezena.'};
    }

    const trimmed = caption.trim() || null;

    const updated = await db
      .update(galleryFiles)
      .set({caption: trimmed})
      .where(
        and(
          eq(galleryFiles.galleryId, gallery.id),
          eq(galleryFiles.fileId, file.id),
        ),
      )
      .returning({id: galleryFiles.id});

    if (updated.length === 0) {
      return {
        success: false,
        error: 'Propojení fotky s galerií nebylo nalezeno.',
      };
    }

    return {success: true};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updatePhotoCaption] Failed:', error);
    return {success: false, error: 'Uložení popisku selhalo.'};
  }
}

type DeleteResult = {success: true} | {success: false; error: string};

/**
 * Deletes a file from the fotogallery storage bucket and removes the
 * corresponding `files` row (which cascades to `gallery_files`).
 */
export async function deleteGalleryFile(
  folder: string,
  fileName: string,
): Promise<DeleteResult> {
  if (!isValidFolderName(folder)) {
    return {success: false, error: 'Neplatný název složky.'};
  }

  const supabase = await createClient();
  const {data, error: authError} = await supabase.auth.getUser();
  if (authError || !data.user) {
    return {success: false, error: 'Nepřihlášený uživatel.'};
  }

  const safeName = sanitizePathSegment(fileName);
  const storagePath = `${folder}/${safeName}`;

  try {
    await db
      .delete(files)
      .where(
        and(
          eq(files.storageBucket, FOTOGALLERY_BUCKET),
          eq(files.storagePath, storagePath),
        ),
      );

    const {error: storageError} = await supabase.storage
      .from(FOTOGALLERY_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      // eslint-disable-next-line no-console
      console.error('[deleteGalleryFile] Storage delete failed:', storageError);
    }

    return {success: true};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[deleteGalleryFile] Failed:', error);
    return {success: false, error: 'Smazání souboru selhalo.'};
  }
}
