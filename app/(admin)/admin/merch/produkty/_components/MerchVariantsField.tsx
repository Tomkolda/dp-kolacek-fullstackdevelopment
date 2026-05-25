'use client';

import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {IconPlus, IconTrash} from '@tabler/icons-react';

import {
  MERCH_APPAREL_SIZES,
  MERCH_AVAILABILITIES,
  MERCH_MUSIC_RELEASE_FORMATS,
  type MerchApparelSize,
  type MerchAvailability,
  type MerchCategory,
  type MerchMusicReleaseFormat,
} from '@/db/types';
import {
  MERCH_AVAILABILITY_LABELS,
  MERCH_CATEGORY_LABELS,
} from '@/lib/utils/merch';

export type MerchVariantFormValue = {
  _id: string;
  priceCzk: number | '';
  availability: MerchAvailability;
  notes: string;
  // music_release
  format: MerchMusicReleaseFormat;
  edition: string;
  // tshirt / hoodie
  size: MerchApparelSize;
  color: string;
  fit: string;
  // accessory
  label: string;
};

const AVAILABILITY_DATA = MERCH_AVAILABILITIES.map((a) => ({
  value: a,
  label: MERCH_AVAILABILITY_LABELS[a],
}));

const FORMAT_DATA = MERCH_MUSIC_RELEASE_FORMATS.map((f) => ({
  value: f,
  label: f.toUpperCase(),
}));

const SIZE_DATA = MERCH_APPAREL_SIZES.map((s) => ({value: s, label: s}));

export function createEmptyVariant(): MerchVariantFormValue {
  return {
    _id: crypto.randomUUID(),
    priceCzk: '',
    availability: 'in_stock',
    notes: '',
    format: 'cd',
    edition: '',
    size: 'M',
    color: '',
    fit: '',
    label: '',
  };
}

type MerchVariantsFieldProps = {
  category: MerchCategory | '';
  variants: MerchVariantFormValue[];
  onChangeAction: (variants: MerchVariantFormValue[]) => void;
  disabled?: boolean;
};

export function MerchVariantsField({
  category,
  variants,
  onChangeAction,
  disabled,
}: MerchVariantsFieldProps) {
  if (!category) {
    return (
      <Text size="sm" c="dimmed">
        Nejdřív vyber kategorii produktu.
      </Text>
    );
  }

  const updateVariant = (
    index: number,
    patch: Partial<MerchVariantFormValue>,
  ) => {
    const updated = variants.map((v, i) =>
      i === index ? {...v, ...patch} : v,
    );
    onChangeAction(updated);
  };

  const removeVariant = (index: number) => {
    onChangeAction(variants.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    onChangeAction([...variants, createEmptyVariant()]);
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text fw={500} size="sm">
          Varianty ({MERCH_CATEGORY_LABELS[category]})
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          disabled={disabled}
          onClick={addVariant}>
          Přidat variantu
        </Button>
      </Group>

      {variants.length === 0 && (
        <Text size="sm" c="dimmed">
          Zatím žádné varianty. Přidej alespoň jednu.
        </Text>
      )}

      {variants.map((variant, index) => (
        <Group
          key={variant._id}
          gap="xs"
          align="flex-end"
          wrap="wrap"
          style={{
            padding: 'var(--mantine-spacing-xs)',
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-default-border)',
          }}>
          {category === 'music_release' && (
            <>
              <Select
                size="xs"
                label="Formát"
                data={FORMAT_DATA}
                value={variant.format}
                onChange={(val) =>
                  updateVariant(index, {
                    format: (val as MerchMusicReleaseFormat) ?? 'cd',
                  })
                }
                disabled={disabled}
                style={{flex: '0 0 100px'}}
              />
              <TextInput
                size="xs"
                label="Edice"
                placeholder="např. Limited"
                value={variant.edition}
                onChange={(e) =>
                  updateVariant(index, {edition: e.currentTarget.value})
                }
                disabled={disabled}
                style={{flex: '1 1 120px'}}
              />
            </>
          )}

          {(category === 'tshirt' || category === 'hoodie') && (
            <>
              <Select
                size="xs"
                label="Velikost"
                data={SIZE_DATA}
                value={variant.size}
                onChange={(val) =>
                  updateVariant(index, {
                    size: (val as MerchApparelSize) ?? 'M',
                  })
                }
                disabled={disabled}
                style={{flex: '0 0 80px'}}
              />
              <TextInput
                size="xs"
                label="Barva"
                placeholder="např. černá"
                value={variant.color}
                onChange={(e) =>
                  updateVariant(index, {color: e.currentTarget.value})
                }
                disabled={disabled}
                style={{flex: '1 1 100px'}}
              />
              <TextInput
                size="xs"
                label="Střih"
                placeholder="např. unisex"
                value={variant.fit}
                onChange={(e) =>
                  updateVariant(index, {fit: e.currentTarget.value})
                }
                disabled={disabled}
                style={{flex: '1 1 100px'}}
              />
            </>
          )}

          {category === 'accessory' && (
            <TextInput
              size="xs"
              label="Označení"
              placeholder="např. Samolepka A5"
              value={variant.label}
              onChange={(e) =>
                updateVariant(index, {label: e.currentTarget.value})
              }
              disabled={disabled}
              style={{flex: '1 1 150px'}}
            />
          )}

          <NumberInput
            size="xs"
            label="Cena (Kč)"
            placeholder="0"
            min={0}
            allowNegative={false}
            value={variant.priceCzk}
            onChange={(val) =>
              updateVariant(index, {priceCzk: val === '' ? '' : Number(val)})
            }
            disabled={disabled}
            style={{flex: '0 0 100px'}}
          />

          <Select
            size="xs"
            label="Dostupnost"
            data={AVAILABILITY_DATA}
            value={variant.availability}
            onChange={(val) =>
              updateVariant(index, {
                availability: (val as MerchAvailability) ?? 'in_stock',
              })
            }
            disabled={disabled}
            style={{flex: '0 0 140px'}}
          />

          <Tooltip label="Odebrat variantu">
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              disabled={disabled}
              onClick={() => removeVariant(index)}
              aria-label="Odebrat variantu">
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ))}
    </Stack>
  );
}
