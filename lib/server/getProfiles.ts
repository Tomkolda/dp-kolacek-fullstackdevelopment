import {asc, isNull} from 'drizzle-orm';

import {db} from '@/db/client';
import {profiles} from '@/db/schema';
import type {DBProfile} from '@/db/types';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export async function getProfiles(): Promise<DBProfile[]> {
  try {
    const profilesData = await db
      .select()
      .from(profiles)
      .where(isNull(profiles.archivedAt))
      .orderBy(asc(profiles.order));

    return profilesData.map((profile) => ({
      ...profile,
      icon: getImageUrl('icons', profile.icon),
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getProfiles] Failed to fetch profiles:', error);
    return [];
  }
}
