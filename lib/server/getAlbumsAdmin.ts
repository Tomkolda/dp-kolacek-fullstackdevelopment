import {asc, desc} from 'drizzle-orm';

import {db} from '@/db/client';
import {albums} from '@/db/schema';
import type {DBAlbum} from '@/db/types';

/**
 * Fetches all albums for admin purposes, including archived ones.
 * Results are ordered by release date descending (newest first).
 */
export async function getAlbumsAdmin(): Promise<DBAlbum[]> {
  try {
    return await db
      .select()
      .from(albums)
      .orderBy(desc(albums.releaseDate), asc(albums.order), asc(albums.title));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getAlbumsAdmin] Failed to fetch albums:', error);
    return [];
  }
}
