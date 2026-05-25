import {asc, desc} from 'drizzle-orm';

import {db} from '@/db/client';
import {linkRedirector} from '@/db/schema';
import type {DBRedirect} from '@/db/types';

/**
 * Fetches all link redirector records for admin purposes, including archived ones.
 * Results are ordered by last update descending.
 */
export async function getLinkRedirectsAdmin(): Promise<DBRedirect[]> {
  try {
    return await db
      .select()
      .from(linkRedirector)
      .orderBy(desc(linkRedirector.updatedAt), asc(linkRedirector.path));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[getLinkRedirectsAdmin] Failed to fetch link redirector records:',
      error,
    );
    return [];
  }
}
