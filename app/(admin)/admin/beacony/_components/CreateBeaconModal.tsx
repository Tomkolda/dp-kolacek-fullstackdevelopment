'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {createBeacon} from '@/lib/server/createBeacon';

import {
  beaconFormFields,
  beaconFormValidate,
  initialBeaconFormValues,
  toBeaconInput,
} from './beaconForm';

type CreateBeaconModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateBeaconModal({
  opened,
  onCloseAction,
}: CreateBeaconModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nový beacon"
      submitLabel="Vytvořit beacon"
      errorMessage="Nepodařilo se vytvořit beacon."
      successNotification="Beacon vytvořen"
      errorNotification="Chyba při vytváření beaconu"
      initialValues={initialBeaconFormValues}
      validate={beaconFormValidate}
      fields={beaconFormFields}
      onSubmitAction={async (values) => createBeacon(toBeaconInput(values))}
    />
  );
}
