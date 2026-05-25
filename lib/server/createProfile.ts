'use server';

import {db} from '@/db/client';
import {profiles} from '@/db/schema';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';
import {
  normalizeProfileLink,
  validateProfileLink,
} from '@/lib/utils/profileLink';

export type CreateProfileResult = CreateActionResult;

export async function createProfile(input: {
  name: string;
  icon: string;
  link: string;
  iconColor: string | null;
  description: string | null;
}): Promise<CreateProfileResult> {
  return runCreateRecordAction({
    actionName: 'createProfile',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit profil.',
    validate: (raw) => validateProfileLink(raw.link),
    executeInsert: async ({input: raw, userId}) => {
      await db.insert(profiles).values({
        name: raw.name.trim(),
        icon: raw.icon.trim(),
        link: normalizeProfileLink(raw.link),
        iconColor: raw.iconColor?.trim() || null,
        description: raw.description?.trim() || null,
        createdBy: userId,
        updatedBy: userId,
      });
    },
    revalidatePaths: ['/admin/profily', '/'],
    constraintErrors: [
      {
        includes: 'profiles_name_idx',
        message: 'Profil se stejným názvem již existuje.',
      },
    ],
  });
}
