import {
  type FormField,
  type FormValidate,
} from '@/components/shared/AdminModal/types';
import type {DBProfile} from '@/db/types';
import {
  asOptionalString,
  createRequiredTextValidator,
} from '@/lib/utils/adminForm';
import {
  normalizeProfileLink,
  validateProfileLink,
} from '@/lib/utils/profileLink';

export type ProfileFormValues = {
  name: string;
  icon: string;
  link: string;
  iconColor: string;
  description: string;
};

export const initialProfileFormValues: ProfileFormValues = {
  name: '',
  icon: '',
  link: '',
  iconColor: '',
  description: '',
};

export const profileFormValidate: FormValidate<ProfileFormValues> = {
  name: createRequiredTextValidator('Název je povinný'),
  link: (value) => {
    const link = asOptionalString(value);
    if (!link) return 'Odkaz je povinný';
    return validateProfileLink(link);
  },
};

export const profileFormFields: Array<FormField<ProfileFormValues>> = [
  {
    type: 'text',
    name: 'name',
    label: 'Název',
    placeholder: 'Např. Instagram',
    required: true,
  },
  {
    type: 'storageImage',
    name: 'icon',
    bucket: 'icons',
    label: 'Ikona',
    required: true,
  },
  {
    type: 'text',
    name: 'link',
    label: 'Odkaz',
    placeholder: '/spotify',
    required: true,
  },
  {
    type: 'text',
    name: 'iconColor',
    label: 'Barva ikony',
    placeholder: 'Např. #E1306C',
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Popis',
    placeholder: 'Volitelný popis profilu',
    minRows: 2,
    maxRows: 4,
  },
];

export function toProfileInput(values: ProfileFormValues) {
  return {
    name: values.name,
    icon: values.icon,
    link: normalizeProfileLink(values.link),
    iconColor: values.iconColor || null,
    description: values.description || null,
  };
}

export function toProfileFormValues(profile: DBProfile): ProfileFormValues {
  return {
    name: profile.name,
    icon: profile.icon,
    link: profile.link,
    iconColor: profile.iconColor ?? '',
    description: profile.description ?? '',
  };
}
