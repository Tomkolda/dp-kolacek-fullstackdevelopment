'use server';

import {asc, eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {files, merchProductFiles} from '@/db/schema';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export type MerchProductImageAdmin = {
  fileId: number;
  url: string;
  caption: string | null;
};

export async function getMerchProductImages(
  productId: number,
): Promise<MerchProductImageAdmin[]> {
  try {
    const rows = await db
      .select({
        fileId: merchProductFiles.fileId,
        storageBucket: files.storageBucket,
        storagePath: files.storagePath,
        caption: merchProductFiles.caption,
      })
      .from(merchProductFiles)
      .innerJoin(files, eq(merchProductFiles.fileId, files.id))
      .where(eq(merchProductFiles.productId, productId))
      .orderBy(asc(merchProductFiles.order));

    return rows.map((row) => ({
      fileId: row.fileId,
      url: getImageUrl(row.storageBucket, row.storagePath),
      caption: row.caption,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getMerchProductImages] Failed:', error);
    return [];
  }
}
