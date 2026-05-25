'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {createSponsor} from '@/lib/server/createSponsor';

import {
  initialSponsorFormValues,
  sponsorFormFields,
  sponsorFormValidate,
  toSponsorInput,
} from './sponsorForm';

type CreateSponsorModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateSponsorModal({
  opened,
  onCloseAction,
}: CreateSponsorModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nový sponzor"
      submitLabel="Vytvořit sponzora"
      errorMessage="Nepodařilo se vytvořit sponzora."
      successNotification="Sponzor vytvořen"
      errorNotification="Chyba při vytváření sponzora"
      initialValues={initialSponsorFormValues}
      validate={sponsorFormValidate}
      fields={sponsorFormFields}
      onSubmitAction={async (values) => createSponsor(toSponsorInput(values))}
    />
  );
}
