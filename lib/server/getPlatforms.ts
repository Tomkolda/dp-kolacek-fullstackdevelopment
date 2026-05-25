import {asc, isNull} from 'drizzle-orm';

import {db} from '@/db/client';
import {platforms} from '@/db/schema';
import type {DBPlatform} from '@/db/types';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export async function getPlatforms(): Promise<DBPlatform[]> {
  try {
    const platformsData = await db
      .select()
      .from(platforms)
      .where(isNull(platforms.archivedAt))
      .orderBy(asc(platforms.order));

    return platformsData.map((platform) => ({
      ...platform,
      image: getImageUrl('platforms', platform.image),
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getPlatforms] Failed to fetch platforms:', error);
    return [];
  }
}
