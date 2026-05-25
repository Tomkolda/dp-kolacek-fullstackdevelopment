import {asc, isNull} from 'drizzle-orm';

import {db} from '@/db/client';
import {sponsors} from '@/db/schema';
import type {DBSponsor} from '@/db/types';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export async function getSponsors(): Promise<DBSponsor[]> {
  try {
    const sponsorsData = await db
      .select()
      .from(sponsors)
      .where(isNull(sponsors.archivedAt))
      .orderBy(asc(sponsors.order));

    return sponsorsData.map((sponsor) => ({
      ...sponsor,
      image: getImageUrl('sponsors', sponsor.image),
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getSponsors] Failed to fetch sponsors:', error);
    return [];
  }
}
