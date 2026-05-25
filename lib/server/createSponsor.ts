'use server';

import {db} from '@/db/client';
import {sponsors} from '@/db/schema';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';
import {isHttpUrl} from '@/lib/utils/url';

export type CreateSponsorResult = CreateActionResult;

type CreateSponsorInput = {
  name: string;
  image: string;
  link: string;
  description: string | null;
  logoScale: number | null;
  logoTranslateY: number | null;
};

function validateCreateSponsorInput(input: CreateSponsorInput): string | null {
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

export async function createSponsor(
  input: CreateSponsorInput,
): Promise<CreateSponsorResult> {
  return runCreateRecordAction({
    actionName: 'createSponsor',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit sponzora.',
    validate: validateCreateSponsorInput,
    executeInsert: async ({input: raw, userId}) => {
      await db.insert(sponsors).values({
        name: raw.name.trim(),
        image: raw.image.trim(),
        link: raw.link.trim(),
        description: raw.description?.trim() || null,
        logoScale: raw.logoScale,
        logoTranslateY: raw.logoTranslateY,
        createdBy: userId,
        updatedBy: userId,
      });
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
