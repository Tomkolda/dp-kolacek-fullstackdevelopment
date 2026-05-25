'use client';

import {Text} from '@mantine/core';
import {useEffect, useMemo, useState} from 'react';

import {Form} from '@/components/shared/AdminModal/Form';
import type {AdminBeacon} from '@/lib/server/getBeaconsAdmin';
import {updateBeacon} from '@/lib/server/updateBeacon';
import {getUserNameById} from '@/lib/utils/getUserNameById';

import {
  beaconFormFields,
  beaconFormValidate,
  toBeaconFormValues,
  toBeaconInput,
} from './beaconForm';

type EditBeaconModalProps = {
  opened: boolean;
  beacon: AdminBeacon | null;
  onCloseAction: () => void;
};

export function EditBeaconModal({
  opened,
  beacon,
  onCloseAction,
}: EditBeaconModalProps) {
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !beacon?.updatedBy) {
      setUpdatedByName(null);
      return;
    }

    void getUserNameById(beacon.updatedBy).then(setUpdatedByName);
  }, [opened, beacon?.updatedBy]);

  const fields = useMemo(() => {
    if (!beacon) return beaconFormFields;

    const updatedAtLabel = beacon.updatedAt
      ? new Date(beacon.updatedAt).toLocaleString('cs-CZ')
      : 'Neznámé';
    const updatedByLabel = updatedByName ?? beacon.updatedBy;

    return [
      ...beaconFormFields,
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
  }, [beacon, updatedByName]);

  if (!beacon) return null;

  return (
    <Form
      key={beacon.id}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit beacon"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit beacon."
      successNotification="Beacon upraven"
      errorNotification="Chyba při úpravě beaconu"
      initialValues={toBeaconFormValues(beacon)}
      validate={beaconFormValidate}
      fields={fields}
      onSubmitAction={async (values) =>
        updateBeacon(beacon.id, toBeaconInput(values))
      }
    />
  );
}
