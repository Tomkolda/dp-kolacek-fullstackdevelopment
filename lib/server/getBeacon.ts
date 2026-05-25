import {and, eq, isNull} from 'drizzle-orm';
import {cache} from 'react';

import {db} from '@/db/client';
import {beacons, files} from '@/db/schema';
import type {DBBeacon} from '@/db/types';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export type BeaconWithImage = DBBeacon & {
  imageUrl: string | null;
};

export const getBeaconBySlug = cache(
  async (slug: string): Promise<BeaconWithImage | null> => {
    try {
      const rows = await db
        .select({
          beacon: beacons,
          storageBucket: files.storageBucket,
          storagePath: files.storagePath,
        })
        .from(beacons)
        .leftJoin(files, eq(beacons.imageFileId, files.id))
        .where(and(eq(beacons.slug, slug), isNull(beacons.archivedAt)))
        .limit(1);

      const row = rows[0];
      if (!row) return null;

      const imageUrl =
        row.storageBucket && row.storagePath
          ? getImageUrl(row.storageBucket, row.storagePath)
          : null;

      return {...row.beacon, imageUrl};
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[getBeaconBySlug] Failed to fetch beacon:', error);
      return null;
    }
  },
);
