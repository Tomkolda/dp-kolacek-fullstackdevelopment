import {asc, desc} from 'drizzle-orm';

import {db} from '@/db/client';
import {gigs} from '@/db/schema';
import type {DBGig} from '@/db/types';

/**
 * Fetches all gigs for admin purposes, including archived ones.
 * Results are ordered by date descending (newest first).
 */
export async function getGigsAdmin(): Promise<DBGig[]> {
  try {
    return await db
      .select()
      .from(gigs)
      .orderBy(desc(gigs.date), asc(gigs.title));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getGigsAdmin] Failed to fetch gigs:', error);
    return [];
  }
}
