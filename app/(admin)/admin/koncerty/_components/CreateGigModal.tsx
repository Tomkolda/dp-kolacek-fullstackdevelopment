'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {createGig} from '@/lib/server/createGig';

import {
  gigFormFields,
  gigFormValidate,
  initialGigFormValues,
  toGigInput,
} from './gigForm';

type CreateGigModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateGigModal({opened, onCloseAction}: CreateGigModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nový koncert"
      submitLabel="Vytvořit koncert"
      errorMessage="Nepodařilo se vytvořit koncert."
      successNotification="Koncert vytvořen"
      errorNotification="Chyba při vytváření koncertu"
      initialValues={initialGigFormValues}
      validate={gigFormValidate}
      fields={gigFormFields}
      onSubmitAction={async (values) => createGig(toGigInput(values))}
    />
  );
}
