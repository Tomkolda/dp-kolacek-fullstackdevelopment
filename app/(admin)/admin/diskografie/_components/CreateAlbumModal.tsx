'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {createAlbum} from '@/lib/server/createAlbum';

import {
  albumFormFields,
  albumFormValidate,
  initialAlbumFormValues,
  toAlbumInput,
} from './albumForm';

type CreateAlbumModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateAlbumModal({
  opened,
  onCloseAction,
}: CreateAlbumModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nové album"
      submitLabel="Vytvořit album"
      errorMessage="Nepodařilo se vytvořit album."
      successNotification="Album vytvořeno"
      errorNotification="Chyba při vytváření alba"
      initialValues={initialAlbumFormValues}
      validate={albumFormValidate}
      fields={albumFormFields}
      onSubmitAction={async (values) => createAlbum(toAlbumInput(values))}
    />
  );
}
