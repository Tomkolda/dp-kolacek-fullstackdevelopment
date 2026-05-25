'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {gigs} from '@/db/schema';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';
import {parseDateInputForDb, parseTimeInputForDb} from '@/lib/utils/datetime';

export type UpdateGigResult = UpdateActionResult;

export async function updateGig(
  id: number,
  input: {
    title: string;
    city: string;
    location: string | null;
    date: string;
    description: string | null;
    startTime: string | null;
    endTime: string | null;
    price: number | null;
    image: string | null;
    mapLink: string | null;
    facebookLink: string | null;
  },
): Promise<UpdateGigResult> {
  return runUpdateRecordAction({
    actionName: 'updateGig',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit koncert.',
    notFoundErrorMessage: 'Koncert nebyl nalezen.',
    validate: (raw) => {
      if (!raw.title.trim()) return 'Název je povinný.';
      if (!raw.city.trim()) return 'Město je povinné.';
      if (!parseDateInputForDb(raw.date)) return 'Neplatné datum.';

      const startTime = parseTimeInputForDb(raw.startTime ?? undefined);
      const endTime = parseTimeInputForDb(raw.endTime ?? undefined);
      if (raw.startTime?.trim() && !startTime) return 'Neplatný čas začátku.';
      if (raw.endTime?.trim() && !endTime) return 'Neplatný čas konce.';
      if (startTime && endTime && endTime <= startTime) {
        return 'Čas konce musí být po čase začátku.';
      }

      if (raw.price !== null && raw.price < 0) {
        return 'Cena nemůže být záporná.';
      }
      return null;
    },
    executeUpdate: async ({id: gigId, input: raw, userId}) => {
      const date = parseDateInputForDb(raw.date);
      if (!date) throw new Error('Invalid date');

      const updatedRows = await db
        .update(gigs)
        .set({
          title: raw.title.trim(),
          city: raw.city.trim(),
          location: raw.location?.trim() || null,
          date,
          description: raw.description?.trim() || null,
          startTime: parseTimeInputForDb(raw.startTime ?? undefined),
          endTime: parseTimeInputForDb(raw.endTime ?? undefined),
          price: raw.price,
          image: raw.image?.trim() || null,
          mapLink: raw.mapLink?.trim() || null,
          facebookLink: raw.facebookLink?.trim() || null,
          updatedBy: userId,
        })
        .returning({id: gigs.id})
        .where(eq(gigs.id, gigId));

      return updatedRows.length;
    },
    revalidatePaths: ['/admin/koncerty'],
    constraintErrors: [
      {
        includes: 'gigs_title_date_place_uidx',
        message:
          'Koncert se stejným názvem, datem, městem a místem již existuje.',
      },
      {
        includes: 'gigs_title_date_city_null_location_uidx',
        message: 'Koncert se stejným názvem, datem a městem již existuje.',
      },
      {
        includes: 'gigs_time_order_chk',
        message: 'Čas konce musí být po čase začátku.',
      },
    ],
  });
}
