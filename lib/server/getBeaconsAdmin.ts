import {asc, desc, eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {beacons, files} from '@/db/schema';
import type {DBBeacon} from '@/db/types';

export type AdminBeacon = DBBeacon & {
  imagePath: string | null;
};

/**
 * Fetches all beacon records for admin purposes, including archived ones.
 * Joins the `files` table to resolve the image storage path.
 * Results are ordered by last update descending, then by release date ascending.
 */
export async function getBeaconsAdmin(): Promise<AdminBeacon[]> {
  try {
    const rows = await db
      .select({
        beacon: beacons,
        imagePath: files.storagePath,
      })
      .from(beacons)
      .leftJoin(files, eq(beacons.imageFileId, files.id))
      .orderBy(desc(beacons.updatedAt), asc(beacons.releaseDate));

    return rows.map((row) => ({
      ...row.beacon,
      imagePath: row.imagePath,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getBeaconsAdmin] Failed to fetch beacon records:', error);
    return [];
  }
}
