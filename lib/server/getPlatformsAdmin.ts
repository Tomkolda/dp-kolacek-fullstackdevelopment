import {asc} from 'drizzle-orm';

import {db} from '@/db/client';
import {platforms} from '@/db/schema';
import type {DBPlatform} from '@/db/types';

/**
 * Fetches all platforms for admin purposes, including archived ones.
 * Results are ordered by explicit order first and then by name.
 */
export async function getPlatformsAdmin(): Promise<DBPlatform[]> {
  try {
    return await db
      .select()
      .from(platforms)
      .orderBy(asc(platforms.order), asc(platforms.name));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getPlatformsAdmin] Failed to fetch platforms:', error);
    return [];
  }
}
