'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {
  createMerchProduct,
  type MerchProductImageInput,
} from '@/lib/server/createMerchProduct';
import {createClient} from '@/lib/supabase/client';
import {MERCH_BUCKET} from '@/lib/utils/storage';
import {uploadStorageImage} from '@/lib/utils/uploadStorageImage';

import {
  initialMerchProductFormValues,
  merchProductFormFields,
  merchProductFormValidate,
  toMerchProductInput,
} from './merchProductForm';

type CreateMerchProductModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateMerchProductModal({
  opened,
  onCloseAction,
}: CreateMerchProductModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nový merch produkt"
      submitLabel="Vytvořit produkt"
      errorMessage="Nepodařilo se vytvořit merch produkt."
      successNotification="Merch produkt vytvořen"
      errorNotification="Chyba při vytváření merch produktu"
      initialValues={initialMerchProductFormValues}
      validate={merchProductFormValidate}
      fields={merchProductFormFields}
      onSubmitAction={async (values) => {
        const newFiles = values.images.filter((img) => img.type === 'new');
        const uploaded: MerchProductImageInput[] = [];
        const errors: string[] = [];

        for (const item of newFiles) {
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

        return createMerchProduct({
          ...toMerchProductInput(values),
          images: uploaded,
        });
      }}
    />
  );
}
