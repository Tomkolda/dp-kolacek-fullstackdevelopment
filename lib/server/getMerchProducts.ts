'use server';

import {asc, eq, inArray, isNull} from 'drizzle-orm';

import {db} from '@/db/client';
import {files, merchProductFiles, merchProducts} from '@/db/schema';
import type {MerchCategory, MerchVariantValue} from '@/db/types';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export type MerchProductImage = {
  url: string;
  caption: string | null;
  altText: string | null;
};

export type MerchProductListItem = {
  id: number;
  title: string;
  category: MerchCategory;
  description: string | null;
  variants: MerchVariantValue;
  coverImageUrl: string | null;
  images: MerchProductImage[];
};

/** Fetches non-archived merch products with cover image and gallery images. */
export async function getMerchProducts(): Promise<MerchProductListItem[]> {
  try {
    const productRows = await db
      .select({
        id: merchProducts.id,
        title: merchProducts.title,
        category: merchProducts.category,
        description: merchProducts.description,
        variants: merchProducts.variants,
        coverBucket: files.storageBucket,
        coverPath: files.storagePath,
      })
      .from(merchProducts)
      .leftJoin(files, eq(merchProducts.coverFileId, files.id))
      .where(isNull(merchProducts.archivedAt))
      .orderBy(asc(merchProducts.category), asc(merchProducts.title));

    const productIds = productRows.map((r) => r.id);

    let imagesByProductId = new Map<number, MerchProductImage[]>();

    if (productIds.length > 0) {
      const imageRows = await db
        .select({
          productId: merchProductFiles.productId,
          caption: merchProductFiles.caption,
          storageBucket: files.storageBucket,
          storagePath: files.storagePath,
          altText: files.altText,
        })
        .from(merchProductFiles)
        .innerJoin(files, eq(merchProductFiles.fileId, files.id))
        .where(inArray(merchProductFiles.productId, productIds))
        .orderBy(
          asc(merchProductFiles.productId),
          asc(merchProductFiles.order),
        );

      imagesByProductId = imageRows.reduce((map, row) => {
        const existing = map.get(row.productId) ?? [];
        existing.push({
          url: getImageUrl(row.storageBucket, row.storagePath),
          caption: row.caption,
          altText: row.altText,
        });
        map.set(row.productId, existing);
        return map;
      }, new Map<number, MerchProductImage[]>());
    }

    return productRows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      variants: row.variants,
      coverImageUrl:
        row.coverBucket && row.coverPath
          ? getImageUrl(row.coverBucket, row.coverPath)
          : null,
      images: imagesByProductId.get(row.id) ?? [],
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getMerchProducts] Failed to fetch merch products:', error);
    return [];
  }
}
