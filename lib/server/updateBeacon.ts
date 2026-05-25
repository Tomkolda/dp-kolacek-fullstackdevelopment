'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {beacons} from '@/db/schema';
import {BEACON_TYPES, type BeaconType} from '@/db/types';
import {registerStorageFile} from '@/lib/server/registerStorageFile';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';
import {parseDateInputForDb} from '@/lib/utils/datetime';
import {isHttpUrl} from '@/lib/utils/url';

export type UpdateBeaconResult = UpdateActionResult;

type UpdateBeaconInput = {
  slug: string;
  type: string;
  title: string;
  releaseDate: string;
  youtubeLink: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  youtubeEmbedUrl: string | null;
  spotifyLink: string | null;
  appleLink: string | null;
  tidalLink: string | null;
  merchLink: string | null;
};

function validateSlug(slug: string): string | null {
  const trimmed = slug.trim();
  if (!trimmed) return 'Slug je povinný.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return 'Slug smí obsahovat pouze malá písmena, čísla a pomlčky.';
  }
  return null;
}

function validateOptionalUrl(
  value: string | null,
  label: string,
): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isHttpUrl(trimmed)
    ? null
    : `${label} musí být platná URL (http/https).`;
}

function validateUpdateBeaconInput(input: UpdateBeaconInput): string | null {
  const slugError = validateSlug(input.slug);
  if (slugError) return slugError;

  if (!BEACON_TYPES.includes(input.type as BeaconType)) {
    return 'Neplatný typ beaconu.';
  }

  if (!input.title.trim()) return 'Název je povinný.';
  if (!parseDateInputForDb(input.releaseDate)) {
    return 'Datum vydání je povinné nebo má neplatný formát.';
  }

  if (!input.youtubeLink.trim()) return 'YouTube odkaz je povinný.';
  if (!isHttpUrl(input.youtubeLink.trim())) {
    return 'YouTube odkaz musí být platná URL (http/https).';
  }

  const urlFields = [
    {value: input.youtubeEmbedUrl, label: 'YouTube embed URL'},
    {value: input.spotifyLink, label: 'Spotify odkaz'},
    {value: input.appleLink, label: 'Apple Music odkaz'},
    {value: input.tidalLink, label: 'Tidal odkaz'},
    {value: input.merchLink, label: 'Merch odkaz'},
  ];

  for (const {value, label} of urlFields) {
    const error = validateOptionalUrl(value, label);
    if (error) return error;
  }

  return null;
}

const BEACON_IMAGE_BUCKET = 'beacons';

export async function updateBeacon(
  id: number,
  input: UpdateBeaconInput,
): Promise<UpdateBeaconResult> {
  return runUpdateRecordAction({
    actionName: 'updateBeacon',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit beacon.',
    notFoundErrorMessage: 'Beacon nebyl nalezen.',
    validate: validateUpdateBeaconInput,
    executeUpdate: async ({id: beaconId, input: raw, userId}) => {
      let imageFileId: number | null = null;

      if (raw.image) {
        const registerResult = await registerStorageFile(
          BEACON_IMAGE_BUCKET,
          raw.image,
          userId,
        );
        if (!registerResult.success) {
          throw new Error(registerResult.error);
        }
        imageFileId = registerResult.fileId;
      }

      const updatedRows = await db
        .update(beacons)
        .set({
          slug: raw.slug.trim(),
          type: raw.type as BeaconType,
          title: raw.title.trim(),
          releaseDate: parseDateInputForDb(raw.releaseDate)!,
          youtubeLink: raw.youtubeLink.trim(),
          subtitle: raw.subtitle?.trim() || null,
          description: raw.description?.trim() || null,
          imageFileId,
          youtubeEmbedUrl: raw.youtubeEmbedUrl?.trim() || null,
          spotifyLink: raw.spotifyLink?.trim() || null,
          appleLink: raw.appleLink?.trim() || null,
          tidalLink: raw.tidalLink?.trim() || null,
          merchLink: raw.merchLink?.trim() || null,
          updatedBy: userId,
        })
        .returning({id: beacons.id})
        .where(eq(beacons.id, beaconId));

      return updatedRows.length;
    },
    revalidatePaths: ['/admin/beacony'],
    constraintErrors: [
      {
        includes: 'beacons_slug_uidx',
        message: 'Beacon se stejným slugem již existuje.',
      },
    ],
  });
}
