import {
  type FormField,
  type FormValidate,
} from '@/components/shared/AdminModal/types';
import type {DBGig} from '@/db/types';
import {
  asOptionalNumber,
  asOptionalTime,
  createOptionalHttpUrlValidator,
  createRequiredTextValidator,
} from '@/lib/utils/adminForm';
import {
  dateFromDB,
  formatTime,
  isValidTime,
  parseDateInputForDb,
} from '@/lib/utils/datetime';

export type GigFormValues = {
  title: string;
  city: string;
  location: string;
  date: string;
  description: string;
  startTime: string;
  endTime: string;
  price: number | string;
  image: string;
  mapLink: string;
  facebookLink: string;
};

const INVALID_HTTP_URL_MESSAGE =
  'Neplatná URL adresa (povoleno jen http/https)';
const validateOptionalHttpUrl = createOptionalHttpUrlValidator(
  INVALID_HTTP_URL_MESSAGE,
);

export const initialGigFormValues: GigFormValues = {
  title: '',
  city: '',
  location: '',
  date: '',
  description: '',
  startTime: '',
  endTime: '',
  price: '',
  image: '',
  mapLink: '',
  facebookLink: '',
};

export const gigFormValidate: FormValidate<GigFormValues> = {
  title: createRequiredTextValidator('Název je povinný'),
  city: createRequiredTextValidator('Město je povinné'),
  date: (value) => {
    if (!value.trim()) return 'Datum je povinné';
    if (!parseDateInputForDb(value)) return 'Neplatné datum';
    return null;
  },
  startTime: (value) => {
    const startTime = asOptionalTime(value);
    if (!startTime) return null;
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return 'Čas začátku musí být ve formátu hh:mm';
    }
    return isValidTime(startTime) ? null : 'Neplatný čas začátku';
  },
  endTime: (value, values) => {
    const endTime = asOptionalTime(value);
    const startTime = asOptionalTime(values.startTime);
    if (!endTime) return null;
    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      return 'Čas konce musí být ve formátu hh:mm';
    }
    if (!isValidTime(endTime)) {
      return 'Neplatný čas konce';
    }
    if (!startTime) return null;
    return endTime <= startTime ? 'Čas konce musí být po čase začátku' : null;
  },
  price: (value) => {
    const price = asOptionalNumber(value);
    if (price === undefined) return null;
    return price < 0 ? 'Cena nemůže být záporná' : null;
  },
  mapLink: validateOptionalHttpUrl,
  facebookLink: validateOptionalHttpUrl,
};

export const gigFormFields: Array<FormField<GigFormValues>> = [
  {
    type: 'text',
    name: 'title',
    label: 'Název',
    placeholder: 'Např. Letní festival',
    required: true,
  },
  {
    type: 'text',
    name: 'city',
    label: 'Město',
    placeholder: 'Např. Praha',
    required: true,
  },
  {
    type: 'text',
    name: 'location',
    label: 'Místo',
    placeholder: 'Např. Rock Café',
  },
  {
    type: 'date',
    name: 'date',
    label: 'Datum',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Popis',
    placeholder: 'Volitelný popis koncertu',
    minRows: 2,
    maxRows: 5,
  },
  {type: 'time', name: 'startTime', label: 'Začátek', placeholder: 'HH:mm'},
  {type: 'time', name: 'endTime', label: 'Konec', placeholder: 'HH:mm'},
  {
    type: 'number',
    name: 'price',
    label: 'Vstupné (Kč)',
    placeholder: 'Např. 200',
    min: 0,
    allowNegative: false,
  },
  {type: 'storageImage', name: 'image', bucket: 'gigs', label: 'Obrázek'},
  {
    type: 'text',
    name: 'mapLink',
    label: 'Odkaz na mapu',
    placeholder: 'https://maps.google.com/...',
  },
  {
    type: 'text',
    name: 'facebookLink',
    label: 'Facebook událost',
    placeholder: 'https://facebook.com/events/...',
  },
];

/** DB → form (populates edit form with existing gig data). */
export function toGigFormValues(gig: DBGig): GigFormValues {
  return {
    title: gig.title,
    city: gig.city ?? '',
    location: gig.location ?? '',
    date: dateFromDB(gig.date)?.toISODate() ?? '',
    description: gig.description ?? '',
    startTime: formatTime(gig.startTime, 'HH:mm') ?? '',
    endTime: formatTime(gig.endTime, 'HH:mm') ?? '',
    price: gig.price ?? '',
    image: gig.image ?? '',
    mapLink: gig.mapLink ?? '',
    facebookLink: gig.facebookLink ?? '',
  };
}

/** Form → server (converts form values to server action input). */
export function toGigInput(values: GigFormValues) {
  return {
    title: values.title,
    city: values.city,
    location: values.location || null,
    date: values.date,
    description: values.description || null,
    startTime: values.startTime || null,
    endTime: values.endTime || null,
    price: values.price !== '' ? Number(values.price) || null : null,
    image: values.image || null,
    mapLink: values.mapLink || null,
    facebookLink: values.facebookLink || null,
  };
}
