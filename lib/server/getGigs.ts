import {and, asc, gte, isNull} from 'drizzle-orm';

import {db} from '@/db/client';
import {gigs} from '@/db/schema';
import type {DBGig} from '@/db/types';
import {todayDate} from '@/lib/utils/datetime';
import {getImageUrl} from '@/lib/utils/getImageUrl';

const GIG_IMAGES_BUCKET = 'gigs';

type GetGigsOptions = {
  limit?: number;
  all?: boolean;
};

/** Resolves `image` file names to full public URLs. */
function withImageUrls(rows: DBGig[]): DBGig[] {
  return rows.map((gig) => ({
    ...gig,
    image: gig.image ? getImageUrl(GIG_IMAGES_BUCKET, gig.image) : null,
  }));
}

/**
 * Fetches gigs ordered by date ascending.
 * By default returns only upcoming (non-archived) gigs.
 * When `all` is true, returns all gigs including past ones.
 * When `limit` is provided, returns only that many results.
 */
export async function getGigs(options?: GetGigsOptions): Promise<DBGig[]> {
  try {
    if (options?.all) {
      const query = db
        .select()
        .from(gigs)
        .where(isNull(gigs.archivedAt))
        .orderBy(asc(gigs.date));

      if (options.limit) {
        return withImageUrls(await query.limit(options.limit));
      }

      return withImageUrls(await query);
    }

    const today = todayDate();

    const query = db
      .select()
      .from(gigs)
      .where(and(gte(gigs.date, today), isNull(gigs.archivedAt)))
      .orderBy(asc(gigs.date));

    if (options?.limit) {
      return withImageUrls(await query.limit(options.limit));
    }

    return withImageUrls(await query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getGigs] Failed to fetch gigs:', error);
    return [];
  }
}
