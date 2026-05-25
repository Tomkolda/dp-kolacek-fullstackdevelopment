'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {merchProductFiles, merchProducts} from '@/db/schema';
import type {MerchVariantValue} from '@/db/types';
import {registerStorageFile} from '@/lib/server/registerStorageFile';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';
import {MERCH_BUCKET} from '@/lib/utils/storage';

export type MerchProductImageInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type UpdateMerchProductResult = UpdateActionResult;

export async function updateMerchProduct(
  id: number,
  input: {
    title: string;
    description: string | null;
    variants: MerchVariantValue;
    keptFileIds: number[];
    newImages: MerchProductImageInput[];
    coverFileId: number | null;
    newCoverIndex: number | null;
  },
): Promise<UpdateMerchProductResult> {
  return runUpdateRecordAction({
    actionName: 'updateMerchProduct',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit merch produkt.',
    notFoundErrorMessage: 'Produkt nebyl nalezen.',
    validate: (raw) => {
      if (!raw.title.trim()) return 'Název produktu je povinný.';
      if (!Array.isArray(raw.variants) || raw.variants.length === 0) {
        return 'Produkt musí mít alespoň jednu variantu.';
      }
      return null;
    },
    executeUpdate: async ({id: productId, input: raw, userId}) => {
      const newFileIds: number[] = [];
      for (const img of raw.newImages) {
        const result = await registerStorageFile(
          MERCH_BUCKET,
          img.fileName,
          userId,
          {mimeType: img.mimeType, sizeBytes: img.sizeBytes},
        );
        if (!result.success) throw new Error(result.error);
        newFileIds.push(result.fileId);
      }

      const allFileIds = [...raw.keptFileIds, ...newFileIds];

      let finalCoverFileId: number | null = raw.coverFileId;
      if (
        raw.newCoverIndex !== null &&
        newFileIds[raw.newCoverIndex] !== undefined
      ) {
        finalCoverFileId = newFileIds[raw.newCoverIndex];
      }

      if (finalCoverFileId !== null && !allFileIds.includes(finalCoverFileId)) {
        finalCoverFileId = null;
      }

      return db.transaction(async (tx) => {
        await tx
          .delete(merchProductFiles)
          .where(eq(merchProductFiles.productId, productId));

        if (allFileIds.length > 0) {
          await tx.insert(merchProductFiles).values(
            allFileIds.map((fileId, index) => ({
              productId,
              fileId,
              order: index,
            })),
          );
        }

        const updatedRows = await tx
          .update(merchProducts)
          .set({
            title: raw.title.trim(),
            description: raw.description?.trim() || null,
            variants: raw.variants,
            coverFileId: finalCoverFileId,
            updatedBy: userId,
          })
          .where(eq(merchProducts.id, productId))
          .returning({id: merchProducts.id});

        return updatedRows.length;
      });
    },
    revalidatePaths: ['/admin/merch/produkty', '/merch'],
  });
}
