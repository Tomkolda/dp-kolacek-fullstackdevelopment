'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import type {DBSponsor} from '@/db/types';
import {updateSponsor} from '@/lib/server/updateSponsor';

import {
  sponsorFormFields,
  sponsorFormValidate,
  toSponsorFormValues,
  toSponsorInput,
} from './sponsorForm';

type EditSponsorModalProps = {
  opened: boolean;
  sponsor: DBSponsor | null;
  onCloseAction: () => void;
};

export function EditSponsorModal({
  opened,
  sponsor,
  onCloseAction,
}: EditSponsorModalProps) {
  if (!sponsor) return null;

  return (
    <Form
      key={sponsor.id}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit sponzora"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit sponzora."
      successNotification="Sponzor upraven"
      errorNotification="Chyba při úpravě sponzora"
      initialValues={toSponsorFormValues(sponsor)}
      validate={sponsorFormValidate}
      fields={sponsorFormFields}
      onSubmitAction={async (values) =>
        updateSponsor(sponsor.id, toSponsorInput(values))
      }
    />
  );
}
