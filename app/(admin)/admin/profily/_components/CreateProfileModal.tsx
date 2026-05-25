'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {createProfile} from '@/lib/server/createProfile';

import {
  initialProfileFormValues,
  profileFormFields,
  profileFormValidate,
  toProfileInput,
} from './profileForm';

type CreateProfileModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateProfileModal({
  opened,
  onCloseAction,
}: CreateProfileModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nový profil sociální sítě"
      submitLabel="Vytvořit profil"
      errorMessage="Nepodařilo se vytvořit profil."
      successNotification="Profil vytvořen"
      errorNotification="Chyba při vytváření profilu"
      initialValues={initialProfileFormValues}
      validate={profileFormValidate}
      fields={profileFormFields}
      onSubmitAction={async (values) => createProfile(toProfileInput(values))}
    />
  );
}
