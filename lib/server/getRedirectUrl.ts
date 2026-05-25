import {and, eq, isNull} from 'drizzle-orm';

import {db} from '@/db/client';
import {linkRedirector} from '@/db/schema';
import type {DBRedirect} from '@/db/types';

export async function getRedirectUrl(path: string): Promise<string | null> {
  try {
    const rows: DBRedirect[] = await db
      .select()
      .from(linkRedirector)
      .where(
        and(eq(linkRedirector.path, path), isNull(linkRedirector.archivedAt)),
      )
      .limit(1);

    return rows[0]?.target ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getRedirectUrl] Failed to fetch redirect:', error);
    return null;
  }
}
