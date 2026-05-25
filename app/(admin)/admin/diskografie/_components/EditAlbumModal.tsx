'use client';

import {Text} from '@mantine/core';
import {useEffect, useMemo, useState} from 'react';

import {Form} from '@/components/shared/AdminModal/Form';
import type {DBAlbum} from '@/db/types';
import {updateAlbum} from '@/lib/server/updateAlbum';
import {getUserNameById} from '@/lib/utils/getUserNameById';

import {
  albumFormFields,
  albumFormValidate,
  toAlbumFormValues,
  toAlbumInput,
} from './albumForm';

type EditAlbumModalProps = {
  opened: boolean;
  album: DBAlbum | null;
  onCloseAction: () => void;
};

export function EditAlbumModal({
  opened,
  album,
  onCloseAction,
}: EditAlbumModalProps) {
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !album?.updatedBy) {
      setUpdatedByName(null);
      return;
    }

    let cancelled = false;

    void getUserNameById(album.updatedBy).then((name) => {
      if (cancelled) return;
      setUpdatedByName(name);
    });

    return () => {
      cancelled = true;
    };
  }, [opened, album?.updatedBy]);

  const fields = useMemo(() => {
    if (!album) return albumFormFields;

    const updatedAtLabel = album.updatedAt
      ? new Date(album.updatedAt).toLocaleString('cs-CZ')
      : 'Neznámé';
    const updatedByLabel = updatedByName ?? album.updatedBy;

    return [
      ...albumFormFields,
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
  }, [album, updatedByName]);

  if (!album) return null;

  return (
    <Form
      key={album.id}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit album"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit album."
      successNotification="Album upraveno"
      errorNotification="Chyba při úpravě alba"
      initialValues={toAlbumFormValues(album)}
      validate={albumFormValidate}
      fields={fields}
      onSubmitAction={async (values) =>
        updateAlbum(album.id, toAlbumInput(values))
      }
    />
  );
}
