import {
  type FormField,
  type FormValidate,
} from '@/components/shared/AdminModal/types';
import type {DBPlatform} from '@/db/types';
import {
  asOptionalNumber,
  createRequiredTextValidator,
} from '@/lib/utils/adminForm';

export type PlatformFormValues = {
  name: string;
  image: string;
  link: string;
  description: string;
  logoScale: number | string;
  logoTranslateY: number | string;
};

function normalizeRedirectPath(path: string): string {
  return path.trim().replace(/^\/+/, '');
}

function validateRequiredRedirectPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Odkaz je povinný';
  }

  const normalizedPath = normalizeRedirectPath(value);
  if (!normalizedPath) {
    return 'Odkaz je povinný';
  }
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(normalizedPath)) {
    return 'Odkaz musí být platný redirect path ve formátu /slug';
  }

  return null;
}

function validateOptionalPositiveNumber(
  value: unknown,
  message: string,
): string | null {
  const parsedValue = asOptionalNumber(value);
  if (parsedValue === undefined) return null;
  if (Number.isNaN(parsedValue)) return 'Hodnota musí být číslo';
  return parsedValue <= 0 ? message : null;
}

function validateOptionalInteger(value: unknown): string | null {
  const parsedValue = asOptionalNumber(value);
  if (parsedValue === undefined) return null;
  if (Number.isNaN(parsedValue)) return 'Hodnota musí být číslo';
  return Number.isInteger(parsedValue) ? null : 'Hodnota musí být celé číslo';
}

export const initialPlatformFormValues: PlatformFormValues = {
  name: '',
  image: '',
  link: '',
  description: '',
  logoScale: '',
  logoTranslateY: '',
};

export const platformFormValidate: FormValidate<PlatformFormValues> = {
  name: createRequiredTextValidator('Název je povinný'),
  image: createRequiredTextValidator('Logo je povinné'),
  link: (value) => validateRequiredRedirectPath(value),
  logoScale: (value) =>
    validateOptionalPositiveNumber(value, 'Scale loga musí být větší než 0'),
  logoTranslateY: (value) => validateOptionalInteger(value),
};

export const platformFormFields: Array<FormField<PlatformFormValues>> = [
  {
    type: 'text',
    name: 'name',
    label: 'Název',
    placeholder: 'Např. Spotify',
    required: true,
  },
  {
    type: 'storageImage',
    name: 'image',
    bucket: 'platforms',
    label: 'Logo',
    required: true,
  },
  {
    type: 'text',
    name: 'link',
    label: 'Odkaz',
    placeholder: 'Např. /spotify',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Popis',
    placeholder: 'Volitelný popis platformy',
    minRows: 2,
    maxRows: 4,
  },
  {
    type: 'number',
    name: 'logoScale',
    label: 'Scale loga',
    placeholder: 'Např. 1',
    min: 0.01,
    allowNegative: false,
  },
  {
    type: 'number',
    name: 'logoTranslateY',
    label: 'Posun loga na ose Y',
    placeholder: 'Např. -4',
    allowNegative: true,
  },
];

export function toPlatformInput(values: PlatformFormValues) {
  const logoScale = asOptionalNumber(values.logoScale);
  const logoTranslateY = asOptionalNumber(values.logoTranslateY);

  return {
    name: values.name.trim(),
    image: values.image.trim(),
    link: normalizeRedirectPath(values.link),
    description: values.description.trim() || null,
    logoScale: logoScale ?? null,
    logoTranslateY: logoTranslateY ?? null,
  };
}

export function toPlatformFormValues(platform: DBPlatform): PlatformFormValues {
  return {
    name: platform.name,
    image: platform.image,
    link: `/${platform.link}`,
    description: platform.description ?? '',
    logoScale: platform.logoScale ?? '',
    logoTranslateY: platform.logoTranslateY ?? '',
  };
}
