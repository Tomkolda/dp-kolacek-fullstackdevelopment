'use server';

import {db} from '@/db/client';
import {members} from '@/db/schema';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';

export type CreateMemberResult = CreateActionResult;

export async function createMember(input: {
  name: string;
  instrument: string;
  location: string | null;
  image: string | null;
}): Promise<CreateMemberResult> {
  return runCreateRecordAction({
    actionName: 'createMember',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit člena kapely.',
    validate: (raw) => {
      if (!raw.name.trim()) return 'Jméno je povinné.';
      if (!raw.instrument.trim()) return 'Nástroj je povinný.';
      if (!raw.image?.trim()) return 'Fotka je povinná.';
      return null;
    },
    executeInsert: async ({input: raw, userId}) => {
      const image = raw.image?.trim();
      if (!image) throw new Error('Missing image');

      await db.insert(members).values({
        name: raw.name.trim(),
        instrument: raw.instrument.trim(),
        location: raw.location?.trim() || null,
        image,
        createdBy: userId,
        updatedBy: userId,
      });
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
