import {Select, Text} from '@mantine/core';

import {
  type FormField,
  type FormValidate,
} from '@/components/shared/AdminModal/types';
import {
  type AccessoryMerchVariant,
  type DBMerchProduct,
  type HoodieMerchVariant,
  MERCH_CATEGORIES,
  type MerchCategory,
  type MerchVariantValue,
  type MusicReleaseMerchVariant,
  type TshirtMerchVariant,
} from '@/db/types';
import type {MerchProductImageAdmin} from '@/lib/server/getMerchProductImages';
import {createRequiredTextValidator} from '@/lib/utils/adminForm';
import {MERCH_CATEGORY_LABELS} from '@/lib/utils/merch';

import {MerchImagesField} from './MerchImagesField';
import {
  createEmptyVariant,
  type MerchVariantFormValue,
  MerchVariantsField,
} from './MerchVariantsField';

export type ExistingMerchImage = {
  type: 'existing';
  fileId: number;
  url: string;
};

export type NewMerchImage = {
  type: 'new';
  file: File;
};

export type MerchImageItem = ExistingMerchImage | NewMerchImage;

export type MerchProductFormValues = {
  title: string;
  category: string;
  description: string;
  images: MerchImageItem[];
  coverIndex: number | null;
  variants: MerchVariantFormValue[];
};

export const initialMerchProductFormValues: MerchProductFormValues = {
  title: '',
  category: '',
  description: '',
  images: [],
  coverIndex: null,
  variants: [],
};

const CATEGORY_DATA = MERCH_CATEGORIES.map((c) => ({
  value: c,
  label: MERCH_CATEGORY_LABELS[c],
}));

function validateVariants(
  variants: MerchVariantFormValue[],
  category: string,
): string | null {
  if (variants.length === 0) return 'Přidej alespoň jednu variantu.';

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const n = i + 1;

    if (v.priceCzk === '' || v.priceCzk < 0) {
      return `Varianta ${n}: cena musí být kladné číslo.`;
    }

    if (category === 'music_release' && !v.format) {
      return `Varianta ${n}: formát je povinný.`;
    }
    if ((category === 'tshirt' || category === 'hoodie') && !v.color.trim()) {
      return `Varianta ${n}: barva je povinná.`;
    }
    if (category === 'accessory' && !v.label.trim()) {
      return `Varianta ${n}: označení je povinné.`;
    }
  }

  return null;
}

export const merchProductFormValidate: FormValidate<MerchProductFormValues> = {
  title: createRequiredTextValidator('Název je povinný'),
  category: (value) => {
    if (!value || !MERCH_CATEGORIES.includes(value as MerchCategory)) {
      return 'Vyber kategorii produktu.';
    }
    return null;
  },
  variants: (value, values) => validateVariants(value, values.category),
};

export const merchProductFormFields: Array<FormField<MerchProductFormValues>> =
  [
    {
      type: 'text',
      name: 'title',
      label: 'Název',
      placeholder: 'Např. Free Fall tričko',
      required: true,
    },
    {
      type: 'custom',
      name: 'category',
      render: ({values, setFieldValue, isSaving}) => (
        <Select
          label="Kategorie"
          placeholder="Vyber kategorii"
          data={CATEGORY_DATA}
          value={values.category || null}
          onChange={(val) => {
            setFieldValue('category', val ?? '');
            if (val !== values.category) {
              setFieldValue('variants', val ? [createEmptyVariant()] : []);
            }
          }}
          disabled={isSaving}
          withAsterisk
        />
      ),
    },
    {
      type: 'textarea',
      name: 'description',
      label: 'Popis',
      placeholder: 'Volitelný popis produktu',
      minRows: 2,
      maxRows: 5,
    },
    {
      type: 'custom',
      name: 'images',
      render: ({values, setFieldValue, isSaving}) => (
        <MerchImagesField
          images={values.images}
          coverIndex={values.coverIndex}
          onChangeAction={(images, coverIndex) => {
            setFieldValue('images', images);
            setFieldValue('coverIndex', coverIndex);
          }}
          disabled={isSaving}
        />
      ),
    },
    {
      type: 'custom',
      name: 'variants',
      render: ({values, setFieldValue, isSaving}) => (
        <MerchVariantsField
          category={(values.category as MerchCategory | '') || ''}
          variants={values.variants}
          onChangeAction={(variants) => setFieldValue('variants', variants)}
          disabled={isSaving}
        />
      ),
    },
  ];

function toVariantsInput(
  variants: MerchVariantFormValue[],
  category: MerchCategory,
): MerchVariantValue {
  switch (category) {
    case 'music_release':
      return variants.map<MusicReleaseMerchVariant>((v) => ({
        format: v.format,
        edition: v.edition.trim() || undefined,
        priceCzk: Number(v.priceCzk),
        availability: v.availability,
        notes: v.notes.trim() || undefined,
      }));
    case 'tshirt':
      return variants.map<TshirtMerchVariant>((v) => ({
        size: v.size,
        color: v.color.trim(),
        fit: v.fit.trim() || undefined,
        priceCzk: Number(v.priceCzk),
        availability: v.availability,
        notes: v.notes.trim() || undefined,
      }));
    case 'hoodie':
      return variants.map<HoodieMerchVariant>((v) => ({
        size: v.size,
        color: v.color.trim(),
        fit: v.fit.trim() || undefined,
        priceCzk: Number(v.priceCzk),
        availability: v.availability,
        notes: v.notes.trim() || undefined,
      }));
    case 'accessory':
      return variants.map<AccessoryMerchVariant>((v) => ({
        label: v.label.trim(),
        priceCzk: Number(v.priceCzk),
        availability: v.availability,
        notes: v.notes.trim() || undefined,
      }));
  }
}

export function toMerchProductInput(values: MerchProductFormValues) {
  const category = values.category as MerchCategory;
  return {
    title: values.title,
    category,
    description: values.description || null,
    coverIndex: values.coverIndex,
    variants: toVariantsInput(values.variants, category),
  };
}

function dbVariantsToFormValues(
  variants: MerchVariantValue,
  category: MerchCategory,
): MerchVariantFormValue[] {
  if (!Array.isArray(variants)) return [];

  return variants.map((v) => {
    const base: MerchVariantFormValue = {
      _id: crypto.randomUUID(),
      priceCzk: v.priceCzk,
      availability: v.availability,
      notes: v.notes ?? '',
      format: 'cd',
      edition: '',
      size: 'M',
      color: '',
      fit: '',
      label: '',
    };

    switch (category) {
      case 'music_release': {
        const mv = v as MusicReleaseMerchVariant;
        return {...base, format: mv.format, edition: mv.edition ?? ''};
      }
      case 'tshirt': {
        const tv = v as TshirtMerchVariant;
        return {...base, size: tv.size, color: tv.color, fit: tv.fit ?? ''};
      }
      case 'hoodie': {
        const hv = v as HoodieMerchVariant;
        return {...base, size: hv.size, color: hv.color, fit: hv.fit ?? ''};
      }
      case 'accessory': {
        const av = v as AccessoryMerchVariant;
        return {...base, label: av.label};
      }
    }

    return base;
  });
}

export function toMerchProductFormValues(
  product: DBMerchProduct,
  images: MerchProductImageAdmin[],
): MerchProductFormValues {
  const existingImages: MerchImageItem[] = images.map((img) => ({
    type: 'existing',
    fileId: img.fileId,
    url: img.url,
  }));

  const coverIndex =
    product.coverFileId !== null
      ? images.findIndex((img) => img.fileId === product.coverFileId)
      : null;

  return {
    title: product.title,
    category: product.category,
    description: product.description ?? '',
    images: existingImages,
    coverIndex: coverIndex !== null && coverIndex >= 0 ? coverIndex : null,
    variants: dbVariantsToFormValues(product.variants, product.category),
  };
}

export function makeMerchProductEditFormFields(
  lockedCategory: MerchCategory,
): Array<FormField<MerchProductFormValues>> {
  return [
    {
      type: 'text',
      name: 'title',
      label: 'Název',
      placeholder: 'Např. Free Fall tričko',
      required: true,
    },
    {
      type: 'custom',
      name: 'category',
      render: () => (
        <Text size="sm">
          <Text span fw={500}>
            Kategorie:
          </Text>{' '}
          {MERCH_CATEGORY_LABELS[lockedCategory]}
        </Text>
      ),
    },
    {
      type: 'textarea',
      name: 'description',
      label: 'Popis',
      placeholder: 'Volitelný popis produktu',
      minRows: 2,
      maxRows: 5,
    },
    {
      type: 'custom',
      name: 'images',
      render: ({values, setFieldValue, isSaving}) => (
        <MerchImagesField
          images={values.images}
          coverIndex={values.coverIndex}
          onChangeAction={(images, coverIndex) => {
            setFieldValue('images', images);
            setFieldValue('coverIndex', coverIndex);
          }}
          disabled={isSaving}
        />
      ),
    },
    {
      type: 'custom',
      name: 'variants',
      render: ({values, setFieldValue, isSaving}) => (
        <MerchVariantsField
          category={lockedCategory}
          variants={values.variants}
          onChangeAction={(variants) => setFieldValue('variants', variants)}
          disabled={isSaving}
        />
      ),
    },
  ];
}
