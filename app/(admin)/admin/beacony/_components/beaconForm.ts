import type {
  FormField,
  FormValidate,
} from '@/components/shared/AdminModal/types';
import {BEACON_TYPES} from '@/db/types';
import type {AdminBeacon} from '@/lib/server/getBeaconsAdmin';
import {
  createOptionalHttpUrlValidator,
  createRequiredTextValidator,
} from '@/lib/utils/adminForm';

export type BeaconFormValues = {
  slug: string;
  type: string;
  title: string;
  releaseDate: string;
  youtubeLink: string;
  subtitle: string;
  description: string;
  image: string;
  youtubeEmbedUrl: string;
  spotifyLink: string;
  appleLink: string;
  tidalLink: string;
  merchLink: string;
};

const validateOptionalHttpUrl = createOptionalHttpUrlValidator(
  'Neplatná URL adresa (povoleno jen http/https)',
);

function validateSlug(value: unknown): string | null {
  const slug = String(value).trim();
  if (!slug) return 'Slug je povinný';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Slug smí obsahovat pouze malá písmena, čísla a pomlčky';
  }
  return null;
}

function validateRequiredUrl(value: unknown): string | null {
  const url = String(value).trim();
  if (!url) return 'YouTube odkaz je povinný';
  return validateOptionalHttpUrl(url);
}

const beaconTypeOptions = BEACON_TYPES.map((t) => ({
  value: t,
  label: t === 'single' ? 'Single' : t === 'album' ? 'Album' : 'Videoklip',
}));

export const initialBeaconFormValues: BeaconFormValues = {
  slug: '',
  type: '',
  title: '',
  releaseDate: '',
  youtubeLink: '',
  subtitle: '',
  description: '',
  image: '',
  youtubeEmbedUrl: '',
  spotifyLink: '',
  appleLink: '',
  tidalLink: '',
  merchLink: '',
};

export const beaconFormValidate: FormValidate<BeaconFormValues> = {
  slug: validateSlug,
  type: createRequiredTextValidator('Typ je povinný'),
  title: createRequiredTextValidator('Název je povinný'),
  releaseDate: createRequiredTextValidator('Datum vydání je povinné'),
  youtubeLink: validateRequiredUrl,
  youtubeEmbedUrl: (value) => validateOptionalHttpUrl(String(value)),
  spotifyLink: (value) => validateOptionalHttpUrl(String(value)),
  appleLink: (value) => validateOptionalHttpUrl(String(value)),
  tidalLink: (value) => validateOptionalHttpUrl(String(value)),
  merchLink: (value) => validateOptionalHttpUrl(String(value)),
};

export const beaconFormFields: Array<FormField<BeaconFormValues>> = [
  {
    type: 'text',
    name: 'slug',
    label: 'Slug',
    placeholder: 'muj-beacon',
    required: true,
  },
  {
    type: 'select',
    name: 'type',
    label: 'Typ',
    placeholder: 'Vyberte typ',
    required: true,
    options: beaconTypeOptions,
  },
  {
    type: 'text',
    name: 'title',
    label: 'Název',
    placeholder: 'Název beaconu',
    required: true,
  },
  {
    type: 'date',
    name: 'releaseDate',
    label: 'Datum vydání',
    required: true,
  },
  {
    type: 'text',
    name: 'youtubeLink',
    label: 'YouTube odkaz',
    placeholder: 'https://youtube.com/...',
    required: true,
  },
  {
    type: 'text',
    name: 'subtitle',
    label: 'Podtitul',
    placeholder: 'Volitelný podtitul',
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Popis',
    placeholder: 'Volitelný popis beaconu',
    minRows: 2,
    maxRows: 5,
  },
  {
    type: 'storageImage',
    name: 'image',
    bucket: 'beacons',
    label: 'Obrázek',
  },
  {
    type: 'text',
    name: 'youtubeEmbedUrl',
    label: 'YouTube embed URL',
    placeholder: 'https://www.youtube.com/embed/...',
  },
  {
    type: 'text',
    name: 'spotifyLink',
    label: 'Spotify odkaz',
    placeholder: 'https://open.spotify.com/...',
  },
  {
    type: 'text',
    name: 'appleLink',
    label: 'Apple Music odkaz',
    placeholder: 'https://music.apple.com/...',
  },
  {
    type: 'text',
    name: 'tidalLink',
    label: 'Tidal odkaz',
    placeholder: 'https://tidal.com/...',
  },
  {
    type: 'text',
    name: 'merchLink',
    label: 'Merch odkaz',
    placeholder: 'https://...',
  },
];

export function toBeaconFormValues(beacon: AdminBeacon): BeaconFormValues {
  return {
    slug: beacon.slug,
    type: beacon.type,
    title: beacon.title,
    releaseDate: beacon.releaseDate,
    youtubeLink: beacon.youtubeLink,
    subtitle: beacon.subtitle ?? '',
    description: beacon.description ?? '',
    image: beacon.imagePath ?? '',
    youtubeEmbedUrl: beacon.youtubeEmbedUrl ?? '',
    spotifyLink: beacon.spotifyLink ?? '',
    appleLink: beacon.appleLink ?? '',
    tidalLink: beacon.tidalLink ?? '',
    merchLink: beacon.merchLink ?? '',
  };
}

export function toBeaconInput(values: BeaconFormValues) {
  return {
    slug: values.slug,
    type: values.type,
    title: values.title,
    releaseDate: values.releaseDate,
    youtubeLink: values.youtubeLink,
    subtitle: values.subtitle || null,
    description: values.description || null,
    image: values.image || null,
    youtubeEmbedUrl: values.youtubeEmbedUrl || null,
    spotifyLink: values.spotifyLink || null,
    appleLink: values.appleLink || null,
    tidalLink: values.tidalLink || null,
    merchLink: values.merchLink || null,
  };
}
