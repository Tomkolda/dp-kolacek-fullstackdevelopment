'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import type {DBPlatform} from '@/db/types';
import {updatePlatform} from '@/lib/server/updatePlatform';

import {
  platformFormFields,
  platformFormValidate,
  toPlatformFormValues,
  toPlatformInput,
} from './platformForm';

type EditPlatformModalProps = {
  opened: boolean;
  platform: DBPlatform | null;
  onCloseAction: () => void;
};

export function EditPlatformModal({
  opened,
  platform,
  onCloseAction,
}: EditPlatformModalProps) {
  if (!platform) return null;

  return (
    <Form
      key={platform.id}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit platformu"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit platformu."
      successNotification="Platforma upravena"
      errorNotification="Chyba při úpravě platformy"
      initialValues={toPlatformFormValues(platform)}
      validate={platformFormValidate}
      fields={platformFormFields}
      onSubmitAction={async (values) =>
        updatePlatform(platform.id, toPlatformInput(values))
      }
    />
  );
}
