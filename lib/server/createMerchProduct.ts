'use server';

import {db} from '@/db/client';
import {merchProductFiles, merchProducts} from '@/db/schema';
import type {MerchCategory, MerchVariantValue} from '@/db/types';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';
import {registerStorageFile} from '@/lib/server/registerStorageFile';
import {MERCH_BUCKET} from '@/lib/utils/storage';

export type MerchProductImageInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type CreateMerchProductResult = CreateActionResult;

export async function createMerchProduct(input: {
  title: string;
  category: MerchCategory;
  description: string | null;
  coverIndex: number | null;
  images: MerchProductImageInput[];
  variants: MerchVariantValue;
}): Promise<CreateMerchProductResult> {
  return runCreateRecordAction({
    actionName: 'createMerchProduct',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit merch produkt.',
    validate: (raw) => {
      if (!raw.title.trim()) return 'Název produktu je povinný.';
      if (!raw.category) return 'Kategorie je povinná.';
      if (!Array.isArray(raw.variants) || raw.variants.length === 0) {
        return 'Produkt musí mít alespoň jednu variantu.';
      }
      return null;
    },
    executeInsert: async ({input: raw, userId}) => {
      const fileIds: number[] = [];
      for (const img of raw.images) {
        const result = await registerStorageFile(
          MERCH_BUCKET,
          img.fileName,
          userId,
          {mimeType: img.mimeType, sizeBytes: img.sizeBytes},
        );
        if (!result.success) throw new Error(result.error);
        fileIds.push(result.fileId);
      }

      const coverFileId =
        raw.coverIndex !== null && fileIds[raw.coverIndex] !== undefined
          ? fileIds[raw.coverIndex]
          : null;

      const [product] = await db
        .insert(merchProducts)
        .values({
          title: raw.title.trim(),
          category: raw.category,
          description: raw.description?.trim() || null,
          coverFileId,
          variants: raw.variants,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning({id: merchProducts.id});

      if (fileIds.length > 0) {
        await db.insert(merchProductFiles).values(
          fileIds.map((fileId, index) => ({
            productId: product.id,
            fileId,
            order: index,
          })),
        );
      }
    },
    revalidatePaths: ['/admin/merch/produkty'],
  });
}
