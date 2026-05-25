import {asc} from 'drizzle-orm';

import {db} from '@/db/client';
import {profiles} from '@/db/schema';
import type {DBProfile} from '@/db/types';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export type AdminProfile = DBProfile & {
  iconUrl: string;
};

/**
 * Fetches all profiles for admin purposes, including archived ones.
 * Results are ordered by manual order and then by name.
 */
export async function getProfilesAdmin(): Promise<AdminProfile[]> {
  try {
    const profilesData = await db
      .select()
      .from(profiles)
      .orderBy(asc(profiles.order), asc(profiles.name));

    return profilesData.map((profile) => ({
      ...profile,
      iconUrl: getImageUrl('icons', profile.icon),
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getProfilesAdmin] Failed to fetch profiles:', error);
    return [];
  }
}
