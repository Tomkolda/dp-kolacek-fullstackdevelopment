import {sql} from 'drizzle-orm';

import {db} from '@/db/client';
import {files} from '@/db/schema';
import {createClient} from '@/lib/supabase/server';

export type StorageFileMetadata = {
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
};

type RegisterStorageFileResult =
  | {success: true; fileId: number}
  | {success: false; error: string};

/**
 * Registers a file already uploaded to Supabase Storage in the `files` table.
 *
 * If `metadata` is provided it is used directly; otherwise the function
 * queries Supabase Storage for the file's mime type and size.
 *
 * Returns the `files.id` for FK use.
 */
export async function registerStorageFile(
  bucket: string,
  storagePath: string,
  userId: string,
  metadata?: StorageFileMetadata,
): Promise<RegisterStorageFileResult> {
  try {
    let meta: StorageFileMetadata;

    if (metadata) {
      meta = metadata;
    } else {
      const supabase = await createClient();

      const folder = storagePath.includes('/')
        ? storagePath.substring(0, storagePath.lastIndexOf('/'))
        : '';
      const fileName = storagePath.includes('/')
        ? storagePath.substring(storagePath.lastIndexOf('/') + 1)
        : storagePath;

      const {data: listed, error: listError} = await supabase.storage
        .from(bucket)
        .list(folder, {search: fileName});

      const match = listed?.find((f) => f.name === fileName);

      if (listError || !match) {
        return {success: false, error: 'Soubor nebyl nalezen v úložišti.'};
      }

      const storageMeta = match.metadata as
        | {mimetype?: string; size?: number}
        | undefined;

      meta = {
        mimeType: storageMeta?.mimetype ?? 'application/octet-stream',
        sizeBytes: storageMeta?.size ?? 0,
      };
    }

    const originalName = storagePath.includes('/')
      ? storagePath.substring(storagePath.lastIndexOf('/') + 1)
      : storagePath;

    const [inserted] = await db
      .insert(files)
      .values({
        storageBucket: bucket,
        storagePath,
        originalName,
        mimeType: meta.mimeType,
        sizeBytes: meta.sizeBytes,
        width: meta.width ?? null,
        height: meta.height ?? null,
        createdBy: userId,
        updatedBy: userId,
      })
      .onConflictDoUpdate({
        target: [files.storageBucket, files.storagePath],
        set: {
          mimeType: sql`excluded.mime_type`,
          sizeBytes: sql`excluded.size_bytes`,
          width: sql`excluded.width`,
          height: sql`excluded.height`,
          updatedBy: sql`excluded.updated_by`,
        },
      })
      .returning({id: files.id});

    if (!inserted) {
      return {success: false, error: 'Nepodařilo se zaregistrovat soubor.'};
    }

    return {success: true, fileId: inserted.id};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[registerStorageFile] Failed:', error);
    return {success: false, error: 'Registrace souboru selhala.'};
  }
}
