'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {profiles} from '@/db/schema';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';
import {
  normalizeProfileLink,
  validateProfileLink,
} from '@/lib/utils/profileLink';

export type UpdateProfileResult = UpdateActionResult;

export async function updateProfile(
  id: number,
  input: {
    name: string;
    icon: string;
    link: string;
    iconColor: string | null;
    description: string | null;
  },
): Promise<UpdateProfileResult> {
  return runUpdateRecordAction({
    actionName: 'updateProfile',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit profil.',
    notFoundErrorMessage: 'Profil nebyl nalezen.',
    validate: (raw) => validateProfileLink(raw.link),
    executeUpdate: async ({id: profileId, input: raw, userId}) => {
      const updatedRows = await db
        .update(profiles)
        .set({
          name: raw.name.trim(),
          icon: raw.icon.trim(),
          link: normalizeProfileLink(raw.link),
          iconColor: raw.iconColor?.trim() || null,
          description: raw.description?.trim() || null,
          updatedBy: userId,
        })
        .returning({id: profiles.id})
        .where(eq(profiles.id, profileId));

      return updatedRows.length;
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
