'use server';

import {db} from '@/db/client';
import {beacons} from '@/db/schema';
import {BEACON_TYPES, type BeaconType} from '@/db/types';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';
import {registerStorageFile} from '@/lib/server/registerStorageFile';
import {parseDateInputForDb} from '@/lib/utils/datetime';
import {isHttpUrl} from '@/lib/utils/url';

export type CreateBeaconResult = CreateActionResult;

type CreateBeaconInput = {
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

function validateCreateBeaconInput(input: CreateBeaconInput): string | null {
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

export async function createBeacon(
  input: CreateBeaconInput,
): Promise<CreateBeaconResult> {
  return runCreateRecordAction({
    actionName: 'createBeacon',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit beacon.',
    validate: validateCreateBeaconInput,
    executeInsert: async ({input: raw, userId}) => {
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

      await db.insert(beacons).values({
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
        createdBy: userId,
        updatedBy: userId,
      });
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
