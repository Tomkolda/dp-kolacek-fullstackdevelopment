import {asc, isNull} from 'drizzle-orm';

import type {BandMember} from '@/components/ui/Team';
import {db} from '@/db/client';
import {members} from '@/db/schema';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export async function getBandMembers(): Promise<BandMember[]> {
  try {
    const membersData = await db
      .select()
      .from(members)
      .where(isNull(members.archivedAt))
      .orderBy(asc(members.order), asc(members.name));

    return membersData.map((member) => ({
      name: member.name,
      location: member.location ?? '',
      role: member.instrument,
      imageUrl: getImageUrl('members', member.image),
      alt: member.name,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getBandMembers] Failed to fetch members:', error);
    return [];
  }
}
