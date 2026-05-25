'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {createPlatform} from '@/lib/server/createPlatform';

import {
  initialPlatformFormValues,
  platformFormFields,
  platformFormValidate,
  toPlatformInput,
} from './platformForm';

type CreatePlatformModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreatePlatformModal({
  opened,
  onCloseAction,
}: CreatePlatformModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nová platforma"
      submitLabel="Vytvořit platformu"
      errorMessage="Nepodařilo se vytvořit platformu."
      successNotification="Platforma vytvořena"
      errorNotification="Chyba při vytváření platformy"
      initialValues={initialPlatformFormValues}
      validate={platformFormValidate}
      fields={platformFormFields}
      onSubmitAction={async (values) => createPlatform(toPlatformInput(values))}
    />
  );
}
