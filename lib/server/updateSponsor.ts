'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {sponsors} from '@/db/schema';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';
import {isHttpUrl} from '@/lib/utils/url';

export type UpdateSponsorResult = UpdateActionResult;

type UpdateSponsorInput = {
  name: string;
  image: string;
  link: string;
  description: string | null;
  logoScale: number | null;
  logoTranslateY: number | null;
};

function validateUpdateSponsorInput(input: UpdateSponsorInput): string | null {
  const name = input.name.trim();
  const image = input.image.trim();
  const link = input.link.trim();

  if (!name) return 'Název je povinný.';
  if (!image) return 'Logo je povinné.';
  if (!link) return 'Odkaz je povinný.';
  if (!isHttpUrl(link)) {
    return 'Odkaz musí být ve formátu http:// nebo https://';
  }
  if (
    input.logoScale !== null &&
    (!Number.isFinite(input.logoScale) || input.logoScale <= 0)
  ) {
    return 'Měřítko loga musí být větší než 0.';
  }
  if (
    input.logoTranslateY !== null &&
    !Number.isInteger(input.logoTranslateY)
  ) {
    return 'Posun loga Y musí být celé číslo.';
  }

  return null;
}

export async function updateSponsor(
  id: number,
  input: UpdateSponsorInput,
): Promise<UpdateSponsorResult> {
  return runUpdateRecordAction({
    actionName: 'updateSponsor',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit sponzora.',
    notFoundErrorMessage: 'Sponzor nebyl nalezen.',
    validate: validateUpdateSponsorInput,
    executeUpdate: async ({id: sponsorId, input: raw, userId}) => {
      const updatedRows = await db
        .update(sponsors)
        .set({
          name: raw.name.trim(),
          image: raw.image.trim(),
          link: raw.link.trim(),
          description: raw.description?.trim() || null,
          logoScale: raw.logoScale,
          logoTranslateY: raw.logoTranslateY,
          updatedBy: userId,
        })
        .returning({id: sponsors.id})
        .where(eq(sponsors.id, sponsorId));

      return updatedRows.length;
    },
    revalidatePaths: ['/admin/sponzori', '/'],
    constraintErrors: [
      {
        includes: 'sponsors_name_idx',
        message: 'Sponzor se stejným názvem již existuje.',
      },
    ],
  });
}
