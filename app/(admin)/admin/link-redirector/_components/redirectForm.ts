import {
  type FormField,
  type FormValidate,
} from '@/components/shared/AdminModal/types';
import type {DBRedirect} from '@/db/types';
import {
  createOptionalHttpUrlValidator,
  createRequiredTextValidator,
} from '@/lib/utils/adminForm';
import {validateLinkRedirectPath} from '@/lib/utils/linkRedirector';

export type RedirectFormValues = {
  path: string;
  title: string;
  target: string;
  description: string;
};

const validateOptionalHttpUrl = createOptionalHttpUrlValidator(
  'Neplatná URL adresa (povoleno jen http/https)',
);

export const initialRedirectFormValues: RedirectFormValues = {
  path: '',
  title: '',
  target: '',
  description: '',
};

export const redirectFormValidate: FormValidate<RedirectFormValues> = {
  path: (value) => validateLinkRedirectPath(String(value)),
  title: createRequiredTextValidator('Název je povinný'),
  target: (value) => {
    const target = String(value).trim();
    if (!target) return 'Cílová URL je povinná';
    return validateOptionalHttpUrl(target);
  },
};

export const redirectFormFields: Array<FormField<RedirectFormValues>> = [
  {
    type: 'text',
    name: 'path',
    label: 'Cesta',
    placeholder: '/moje-kampan',
    required: true,
  },
  {
    type: 'text',
    name: 'title',
    label: 'Název',
    placeholder: 'Např. Spotify bio odkaz',
    required: true,
  },
  {
    type: 'text',
    name: 'target',
    label: 'Cílová URL',
    placeholder: 'https://example.com/...',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Popis',
    placeholder: 'Volitelný popis redirectu',
    minRows: 2,
    maxRows: 4,
  },
];

export function toRedirectFormValues(redirect: DBRedirect): RedirectFormValues {
  return {
    path: redirect.path,
    title: redirect.title,
    target: redirect.target,
    description: redirect.description ?? '',
  };
}

export function toRedirectInput(values: RedirectFormValues) {
  return {
    path: values.path,
    title: values.title,
    target: values.target,
    description: values.description || null,
  };
}
