import type {FormValidateInput} from '@mantine/form';

import {createRequiredTextValidator} from '@/lib/utils/adminForm';
import {slugify} from '@/lib/utils/slugify';

export type GalleryFormValues = {
  title: string;
  slug: string;
  date: string;
  description: string;
};

export const initialGalleryFormValues: GalleryFormValues = {
  title: '',
  slug: '',
  date: '',
  description: '',
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const galleryFormValidate: FormValidateInput<GalleryFormValues> = {
  title: createRequiredTextValidator('Název je povinný'),
  slug: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Slug je povinný';
    if (!SLUG_PATTERN.test(trimmed)) {
      return 'Slug může obsahovat jen malá písmena, číslice a pomlčky';
    }
    return null;
  },
};

export type GalleryPhotoUploadInfo = {
  storagePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
};

export function toGalleryInput(values: GalleryFormValues) {
  return {
    title: values.title.trim(),
    slug: slugify(values.slug.trim()) || values.slug.trim(),
    date: values.date || null,
    description: values.description.trim() || null,
  };
}
