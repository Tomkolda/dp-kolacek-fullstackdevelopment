'use client';

import {Text} from '@mantine/core';
import {useEffect, useMemo, useState} from 'react';

import {Form} from '@/components/shared/AdminModal/Form';
import type {AdminProfile} from '@/lib/server/getProfilesAdmin';
import {updateProfile} from '@/lib/server/updateProfile';
import {getUserNameById} from '@/lib/utils/getUserNameById';

import {
  profileFormFields,
  profileFormValidate,
  toProfileFormValues,
  toProfileInput,
} from './profileForm';

type EditProfileModalProps = {
  opened: boolean;
  profile: AdminProfile | null;
  onCloseAction: () => void;
};

export function EditProfileModal({
  opened,
  profile,
  onCloseAction,
}: EditProfileModalProps) {
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !profile?.updatedBy) {
      setUpdatedByName(null);
      return;
    }

    void getUserNameById(profile.updatedBy).then(setUpdatedByName);
  }, [opened, profile?.updatedBy]);

  const fields = useMemo(() => {
    if (!profile) return profileFormFields;

    const updatedAtLabel = profile.updatedAt
      ? new Date(profile.updatedAt).toLocaleString('cs-CZ')
      : 'Neznámé';
    const updatedByLabel = updatedByName ?? profile.updatedBy;

    return [
      ...profileFormFields,
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
  }, [profile, updatedByName]);

  if (!profile) return null;

  return (
    <Form
      key={profile.id}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit profil sociální sítě"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit profil."
      successNotification="Profil upraven"
      errorNotification="Chyba při úpravě profilu"
      initialValues={toProfileFormValues(profile)}
      validate={profileFormValidate}
      fields={fields}
      onSubmitAction={async (values) =>
        updateProfile(profile.id, toProfileInput(values))
      }
    />
  );
}
