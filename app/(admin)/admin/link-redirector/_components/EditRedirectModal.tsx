'use client';

import {Text} from '@mantine/core';
import {useEffect, useMemo, useState} from 'react';

import {Form} from '@/components/shared/AdminModal/Form';
import type {DBRedirect} from '@/db/types';
import {updateLinkRedirect} from '@/lib/server/updateLinkRedirect';
import {getUserNameById} from '@/lib/utils/getUserNameById';

import {
  redirectFormFields,
  redirectFormValidate,
  toRedirectFormValues,
  toRedirectInput,
} from './redirectForm';

type EditRedirectModalProps = {
  opened: boolean;
  redirect: DBRedirect | null;
  onCloseAction: () => void;
};

export function EditRedirectModal({
  opened,
  redirect,
  onCloseAction,
}: EditRedirectModalProps) {
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !redirect?.updatedBy) {
      setUpdatedByName(null);
      return;
    }

    void getUserNameById(redirect.updatedBy).then(setUpdatedByName);
  }, [opened, redirect?.updatedBy]);

  const fields = useMemo(() => {
    if (!redirect) return redirectFormFields;

    const updatedAtLabel = redirect.updatedAt
      ? new Date(redirect.updatedAt).toLocaleString('cs-CZ')
      : 'Neznámé';
    const updatedByLabel = updatedByName ?? redirect.updatedBy;

    return [
      ...redirectFormFields,
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
  }, [redirect, updatedByName]);

  if (!redirect) return null;

  return (
    <Form
      key={redirect.id}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit redirect"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit redirect."
      successNotification="Redirect upraven"
      errorNotification="Chyba při úpravě redirectu"
      initialValues={toRedirectFormValues(redirect)}
      validate={redirectFormValidate}
      fields={fields}
      onSubmitAction={async (values) =>
        updateLinkRedirect(redirect.id, toRedirectInput(values))
      }
    />
  );
}
