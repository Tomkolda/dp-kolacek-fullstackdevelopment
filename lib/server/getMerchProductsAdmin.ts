import {asc} from 'drizzle-orm';

import {db} from '@/db/client';
import {merchProducts} from '@/db/schema';
import type {DBMerchProduct} from '@/db/types';

/**
 * Fetches all merch products for admin purposes, including archived ones.
 */
export async function getMerchProductsAdmin(): Promise<DBMerchProduct[]> {
  try {
    return await db
      .select()
      .from(merchProducts)
      .orderBy(asc(merchProducts.title));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[getMerchProductsAdmin] Failed to fetch merch products:',
      error,
    );
    return [];
  }
}
