'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {members} from '@/db/schema';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';

export type UpdateMemberResult = UpdateActionResult;

export async function updateMember(
  id: number,
  input: {
    name: string;
    instrument: string;
    location: string | null;
    image: string | null;
  },
): Promise<UpdateMemberResult> {
  return runUpdateRecordAction({
    actionName: 'updateMember',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit člena kapely.',
    notFoundErrorMessage: 'Člen kapely nebyl nalezen.',
    validate: (raw) => {
      if (!raw.name.trim()) return 'Jméno je povinné.';
      if (!raw.instrument.trim()) return 'Nástroj je povinný.';
      if (!raw.image?.trim()) return 'Fotka je povinná.';
      return null;
    },
    executeUpdate: async ({id: memberId, input: raw, userId}) => {
      const image = raw.image?.trim();
      if (!image) throw new Error('Missing image');

      const updatedRows = await db
        .update(members)
        .set({
          name: raw.name.trim(),
          instrument: raw.instrument.trim(),
          location: raw.location?.trim() || null,
          image,
          updatedBy: userId,
        })
        .returning({id: members.id})
        .where(eq(members.id, memberId));

      return updatedRows.length;
    },
    revalidatePaths: ['/admin/sestava', '/'],
    constraintErrors: [
      {
        includes: 'members_name_idx',
        message: 'Člen se stejným jménem již existuje.',
      },
    ],
  });
}
