import {
  type FormField,
  type FormValidate,
} from '@/components/shared/AdminModal/types';
import type {DBSponsor} from '@/db/types';
import {
  asOptionalNumber,
  createRequiredTextValidator,
} from '@/lib/utils/adminForm';
import {isHttpUrl} from '@/lib/utils/url';

export type SponsorFormValues = {
  name: string;
  image: string;
  link: string;
  description: string;
  logoScale: number | string;
  logoTranslateY: number | string;
};

const REQUIRED_LINK_MESSAGE = 'Odkaz je povinný';
const INVALID_HTTP_URL_MESSAGE =
  'Odkaz musí být ve formátu http:// nebo https://';

export const initialSponsorFormValues: SponsorFormValues = {
  name: '',
  image: '',
  link: '',
  description: '',
  logoScale: '',
  logoTranslateY: '',
};

export const sponsorFormValidate: FormValidate<SponsorFormValues> = {
  name: createRequiredTextValidator('Název je povinný'),
  image: createRequiredTextValidator('Logo je povinné'),
  link: (value) => {
    const normalized = value.trim();
    if (!normalized) return REQUIRED_LINK_MESSAGE;
    return isHttpUrl(normalized) ? null : INVALID_HTTP_URL_MESSAGE;
  },
  logoScale: (value) => {
    const logoScale = asOptionalNumber(value);
    if (logoScale === undefined) return null;
    if (!Number.isFinite(logoScale)) return 'Měřítko loga musí být číslo';
    return logoScale <= 0 ? 'Měřítko loga musí být větší než 0' : null;
  },
  logoTranslateY: (value) => {
    const logoTranslateY = asOptionalNumber(value);
    if (logoTranslateY === undefined) return null;
    return Number.isInteger(logoTranslateY)
      ? null
      : 'Posun loga Y musí být celé číslo';
  },
};

export const sponsorFormFields: Array<FormField<SponsorFormValues>> = [
  {
    type: 'text',
    name: 'name',
    label: 'Název',
    placeholder: 'Např. Město Brno',
    required: true,
  },
  {
    type: 'storageImage',
    name: 'image',
    bucket: 'sponsors',
    label: 'Logo (povinné)',
  },
  {
    type: 'text',
    name: 'link',
    label: 'Odkaz',
    placeholder: 'https://example.com',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Popis',
    placeholder: 'Volitelný popis sponzora',
    minRows: 2,
    maxRows: 4,
  },
  {
    type: 'number',
    name: 'logoScale',
    label: 'Měřítko loga',
    placeholder: 'Např. 1.1',
    min: 0,
    allowNegative: false,
  },
  {
    type: 'number',
    name: 'logoTranslateY',
    label: 'Posun loga Y',
    placeholder: 'Např. -4',
    allowNegative: true,
  },
];

export function toSponsorFormValues(sponsor: DBSponsor): SponsorFormValues {
  return {
    name: sponsor.name,
    image: sponsor.image,
    link: sponsor.link,
    description: sponsor.description ?? '',
    logoScale: sponsor.logoScale ?? '',
    logoTranslateY: sponsor.logoTranslateY ?? '',
  };
}

export function toSponsorInput(values: SponsorFormValues) {
  return {
    name: values.name,
    image: values.image,
    link: values.link,
    description: values.description.trim() || null,
    logoScale:
      values.logoScale !== ''
        ? (asOptionalNumber(values.logoScale) ?? null)
        : null,
    logoTranslateY:
      values.logoTranslateY !== ''
        ? (asOptionalNumber(values.logoTranslateY) ?? null)
        : null,
  };
}
