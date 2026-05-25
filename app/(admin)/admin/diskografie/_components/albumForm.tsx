import {
  type FormField,
  type FormValidate,
} from '@/components/shared/AdminModal/types';
import type {AlbumTrack} from '@/db/schema';
import type {DBAlbum} from '@/db/types';
import {
  createOptionalHttpUrlValidator,
  createRequiredTextValidator,
} from '@/lib/utils/adminForm';
import {formatDuration, parseDuration} from '@/lib/utils/datetime';
import {isHttpUrl} from '@/lib/utils/url';

import {type AlbumTrackFormValue, AlbumTracksField} from './AlbumTracksField';

export type AlbumFormValues = {
  title: string;
  releaseDate: string;
  description: string;
  genre: string;
  label: string;
  coverImage: string;
  producedBy: string;
  mixedBy: string;
  recordedBy: string;
  youtubeLink: string;
  spotifyLink: string;
  appleMusicLink: string;
  tidalLink: string;
  tracks: AlbumTrackFormValue[];
};

const INVALID_HTTP_URL_MESSAGE =
  'Neplatná URL adresa (povoleno jen http/https)';
const validateOptionalHttpUrl = createOptionalHttpUrlValidator(
  INVALID_HTTP_URL_MESSAGE,
);

export const initialAlbumFormValues: AlbumFormValues = {
  title: '',
  releaseDate: '',
  description: '',
  genre: '',
  label: '',
  coverImage: '',
  producedBy: '',
  mixedBy: '',
  recordedBy: '',
  youtubeLink: '',
  spotifyLink: '',
  appleMusicLink: '',
  tidalLink: '',
  tracks: [],
};

function validateTracks(tracks: AlbumTrackFormValue[]) {
  const trimmedTracks = tracks
    .map((track, index) => ({
      originalIndex: index,
      ...track,
      title: track.title.trim(),
      duration: track.duration.trim(),
      videoLink: track.videoLink.trim(),
    }))
    .filter((track) => track.title.length > 0);

  if (trimmedTracks.length === 0) return null;

  for (const track of trimmedTracks) {
    const displayIndex = track.originalIndex + 1;

    if (!Number.isInteger(track.trackNumber) || track.trackNumber <= 0) {
      return `Skladba ${displayIndex} má neplatné pořadí`;
    }

    if (track.duration && parseDuration(track.duration) === null) {
      return `Skladba ${displayIndex} má neplatnou délku, použijte formát m:ss`;
    }

    if (track.videoLink && !isHttpUrl(track.videoLink)) {
      return `Skladba ${displayIndex} má neplatný video odkaz`;
    }
  }

  return null;
}

export const albumFormValidate: FormValidate<AlbumFormValues> = {
  title: createRequiredTextValidator('Název je povinný'),
  releaseDate: (value) => {
    const year = value.trim();
    if (!year) return 'Rok vydání je povinný';
    if (!/^\d{4}$/.test(year)) return 'Rok vydání musí být ve formátu RRRR';
    return null;
  },
  coverImage: createRequiredTextValidator('Cover je povinný'),
  youtubeLink: validateOptionalHttpUrl,
  spotifyLink: validateOptionalHttpUrl,
  appleMusicLink: validateOptionalHttpUrl,
  tidalLink: validateOptionalHttpUrl,
  tracks: (value) => validateTracks(value),
};

export const albumFormFields: Array<FormField<AlbumFormValues>> = [
  {
    type: 'text',
    name: 'title',
    label: 'Název',
    placeholder: 'Např. Nové album',
    required: true,
  },
  {
    type: 'text',
    name: 'releaseDate',
    label: 'Rok vydání',
    placeholder: 'Např. 2024',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Popis',
    placeholder: 'Volitelný popis alba',
    minRows: 2,
    maxRows: 5,
  },
  {
    type: 'text',
    name: 'genre',
    label: 'Žánr',
    placeholder: 'Např. post-hardcore',
  },
  {
    type: 'text',
    name: 'label',
    label: 'Label',
    placeholder: 'Např. DIY',
  },
  {
    type: 'storageImage',
    name: 'coverImage',
    bucket: 'albums',
    label: 'Cover',
    required: true,
  },
  {
    type: 'text',
    name: 'producedBy',
    label: 'Produkoval',
    placeholder: 'Např. Jan Novak',
  },
  {
    type: 'text',
    name: 'mixedBy',
    label: 'Mix',
    placeholder: 'Např. Studio XYZ',
  },
  {
    type: 'text',
    name: 'recordedBy',
    label: 'Nahráno ve studiu',
    placeholder: 'Např. Sono Records',
  },
  {
    type: 'text',
    name: 'youtubeLink',
    label: 'YouTube odkaz',
    placeholder: 'https://youtube.com/...',
  },
  {
    type: 'text',
    name: 'spotifyLink',
    label: 'Spotify odkaz',
    placeholder: 'https://open.spotify.com/...',
  },
  {
    type: 'text',
    name: 'appleMusicLink',
    label: 'Apple Music odkaz',
    placeholder: 'https://music.apple.com/...',
  },
  {
    type: 'text',
    name: 'tidalLink',
    label: 'TIDAL odkaz',
    placeholder: 'https://tidal.com/...',
  },
  {
    type: 'custom',
    name: 'tracks',
    render: ({values, setFieldValue, isSaving}) => (
      <AlbumTracksField
        value={values.tracks}
        onChangeAction={(tracks) => setFieldValue('tracks', tracks)}
        disabled={isSaving}
      />
    ),
  },
];

function toAlbumTrackFormValue(
  track: AlbumTrack,
  index: number,
): AlbumTrackFormValue {
  return {
    trackNumber: track.trackNumber || index + 1,
    title: track.title,
    duration: formatDuration(track.durationSeconds) ?? '',
    videoLink: track.videoLink ?? '',
    originalTrack: track,
  };
}

/** DB -> form (populates edit form with existing album data). */
export function toAlbumFormValues(album: DBAlbum): AlbumFormValues {
  return {
    title: album.title,
    releaseDate: album.releaseDate.slice(0, 4),
    description: album.description ?? '',
    genre: album.genre ?? '',
    label: album.label ?? '',
    coverImage: album.coverImage ?? '',
    producedBy: album.producedBy ?? '',
    mixedBy: album.mixedBy ?? '',
    recordedBy: album.recordedBy ?? '',
    youtubeLink: album.youtubeLink ?? '',
    spotifyLink: album.spotifyLink ?? '',
    appleMusicLink: album.appleMusicLink ?? '',
    tidalLink: album.tidalLink ?? '',
    tracks: (album.tracks ?? []).map(toAlbumTrackFormValue),
  };
}

export function toAlbumInput(values: AlbumFormValues) {
  const releaseYear = values.releaseDate.trim();

  return {
    title: values.title,
    releaseDate: `${releaseYear}-01-01`,
    description: values.description || null,
    genre: values.genre || null,
    label: values.label || null,
    coverImage: values.coverImage || null,
    producedBy: values.producedBy || null,
    mixedBy: values.mixedBy || null,
    recordedBy: values.recordedBy || null,
    youtubeLink: values.youtubeLink || null,
    spotifyLink: values.spotifyLink || null,
    appleMusicLink: values.appleMusicLink || null,
    tidalLink: values.tidalLink || null,
    tracks: values.tracks
      .map((track) => ({
        ...(track.originalTrack ?? {}),
        durationSeconds: parseDuration(track.duration) ?? undefined,
        title: track.title.trim(),
        videoLink: track.videoLink.trim() || undefined,
      }))
      .filter((track) => track.title.length > 0)
      .map((track, index) => ({
        ...track,
        trackNumber: index + 1,
      })),
  };
}
