'use client';

import {Text} from '@mantine/core';
import {useEffect, useMemo, useState} from 'react';

import {Form} from '@/components/shared/AdminModal/Form';
import type {DBGig} from '@/db/types';
import {updateGig} from '@/lib/server/updateGig';
import {getUserNameById} from '@/lib/utils/getUserNameById';

import {
  gigFormFields,
  gigFormValidate,
  toGigFormValues,
  toGigInput,
} from './gigForm';

type EditGigModalProps = {
  opened: boolean;
  gig: DBGig | null;
  onCloseAction: () => void;
};

export function EditGigModal({opened, gig, onCloseAction}: EditGigModalProps) {
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !gig?.updatedBy) {
      setUpdatedByName(null);
      return;
    }
    void getUserNameById(gig.updatedBy).then(setUpdatedByName);
  }, [opened, gig?.updatedBy]);

  const fields = useMemo(() => {
    if (!gig) return gigFormFields;

    const updatedAtLabel = gig.updatedAt
      ? new Date(gig.updatedAt).toLocaleString('cs-CZ')
      : 'Neznámé';
    const updatedByLabel = updatedByName ?? gig.updatedBy;

    return [
      ...gigFormFields,
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
  }, [gig, updatedByName]);

  if (!gig) return null;

  return (
    <Form
      key={gig.id}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit koncert"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit koncert."
      successNotification="Koncert upraven"
      errorNotification="Chyba při úpravě koncertu"
      initialValues={toGigFormValues(gig)}
      validate={gigFormValidate}
      fields={fields}
      onSubmitAction={async (values) => updateGig(gig.id, toGigInput(values))}
    />
  );
}
