import {asc} from 'drizzle-orm';

import {db} from '@/db/client';
import {sponsors} from '@/db/schema';
import type {DBSponsor} from '@/db/types';

/**
 * Fetches all sponsors for admin purposes, including archived ones.
 */
export async function getSponsorsAdmin(): Promise<DBSponsor[]> {
  try {
    return await db
      .select()
      .from(sponsors)
      .orderBy(asc(sponsors.order), asc(sponsors.name));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getSponsorsAdmin] Failed to fetch sponsors:', error);
    return [];
  }
}
