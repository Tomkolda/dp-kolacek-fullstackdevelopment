'use client';

import {Loader, Stack, Text} from '@mantine/core';
import {useEffect, useMemo, useState} from 'react';

import {Form} from '@/components/shared/AdminModal/Form';
import type {DBMerchProduct} from '@/db/types';
import {
  getMerchProductImages,
  type MerchProductImageAdmin,
} from '@/lib/server/getMerchProductImages';
import {
  type MerchProductImageInput,
  updateMerchProduct,
} from '@/lib/server/updateMerchProduct';
import {createClient} from '@/lib/supabase/client';
import {getUserNameById} from '@/lib/utils/getUserNameById';
import {MERCH_BUCKET} from '@/lib/utils/storage';
import {uploadStorageImage} from '@/lib/utils/uploadStorageImage';

import {
  type ExistingMerchImage,
  makeMerchProductEditFormFields,
  merchProductFormValidate,
  toMerchProductFormValues,
  toMerchProductInput,
} from './merchProductForm';

type EditMerchProductModalProps = {
  opened: boolean;
  product: DBMerchProduct | null;
  onCloseAction: () => void;
};

export function EditMerchProductModal({
  opened,
  product,
  onCloseAction,
}: EditMerchProductModalProps) {
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<
    MerchProductImageAdmin[] | null
  >(null);
  const [imagesLoading, setImagesLoading] = useState(false);

  useEffect(() => {
    if (!opened || !product) {
      setUpdatedByName(null);
      setProductImages(null);
      return;
    }

    let cancelled = false;

    void getUserNameById(product.updatedBy).then((name) => {
      if (!cancelled) setUpdatedByName(name);
    });

    setImagesLoading(true);
    void getMerchProductImages(product.id).then((images) => {
      if (!cancelled) {
        setProductImages(images);
        setImagesLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [opened, product?.id, product?.updatedBy]);

  const fields = useMemo(() => {
    if (!product) return [];

    const category = product.category;
    const baseFields = makeMerchProductEditFormFields(category);

    const updatedAtLabel = product.updatedAt
      ? new Date(product.updatedAt).toLocaleString('cs-CZ')
      : 'Neznámé';
    const updatedByLabel = updatedByName ?? product.updatedBy;

    return [
      ...baseFields,
      {
        type: 'custom' as const,
        name: 'lastUpdatedInfo',
        render: () => (
          <Text size="xs" c="dimmed">
            Naposledy změněno: {updatedAtLabel} | Uživatel: {updatedByLabel}
          </Text>
        ),
      },
    ];
  }, [product, updatedByName]);

  if (!product) return null;

  if (imagesLoading || productImages === null) {
    return opened ? (
      <Stack align="center" justify="center" p="xl">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Načítání obrázků...
        </Text>
      </Stack>
    ) : null;
  }

  const initialValues = toMerchProductFormValues(product, productImages);

  return (
    <Form
      key={`${product.id}-${productImages.length}`}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit merch produkt"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit merch produkt."
      successNotification="Merch produkt upraven"
      errorNotification="Chyba při úpravě merch produktu"
      initialValues={initialValues}
      validate={merchProductFormValidate}
      fields={fields}
      onSubmitAction={async (values) => {
        const keptExisting = values.images.filter(
          (img): img is ExistingMerchImage => img.type === 'existing',
        );
        const newFiles = values.images.filter((img) => img.type === 'new');

        const keptFileIds = keptExisting.map((img) => img.fileId);

        const uploaded: MerchProductImageInput[] = [];
        const errors: string[] = [];

        for (const item of newFiles) {
          if (item.type !== 'new') continue;
          const result = await uploadStorageImage(MERCH_BUCKET, item.file);
          if (result.success) {
            uploaded.push({
              fileName: result.fileName,
              mimeType: item.file.type,
              sizeBytes: item.file.size,
            });
          } else {
            errors.push(`${item.file.name}: ${result.error}`);
          }
        }

        if (errors.length > 0) {
          const supabase = createClient();
          for (const img of uploaded) {
            await supabase.storage.from(MERCH_BUCKET).remove([img.fileName]);
          }
          return {
            success: false,
            error: `Nahrávání obrázků selhalo (${errors.length}/${newFiles.length}).`,
          };
        }

        const coverItem =
          values.coverIndex !== null ? values.images[values.coverIndex] : null;

        let coverFileId: number | null = null;
        let newCoverIndex: number | null = null;

        if (coverItem?.type === 'existing') {
          coverFileId = coverItem.fileId;
        } else if (coverItem?.type === 'new') {
          const newOnlyIndex = newFiles.indexOf(coverItem);
          if (newOnlyIndex >= 0) {
            newCoverIndex = newOnlyIndex;
          }
        }

        const productInput = toMerchProductInput(values);

        return updateMerchProduct(product.id, {
          title: productInput.title,
          description: productInput.description,
          variants: productInput.variants,
          keptFileIds,
          newImages: uploaded,
          coverFileId,
          newCoverIndex,
        });
      }}
    />
  );
}
