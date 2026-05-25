'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import type {DBMember} from '@/db/types';
import {updateMember} from '@/lib/server/updateMember';

import {
  memberFormFields,
  memberFormValidate,
  toMemberFormValues,
  toMemberInput,
} from './memberForm';

type EditMemberModalProps = {
  opened: boolean;
  member: DBMember | null;
  onCloseAction: () => void;
};

export function EditMemberModal({
  opened,
  member,
  onCloseAction,
}: EditMemberModalProps) {
  if (!member) return null;

  return (
    <Form
      key={member.id}
      opened={opened}
      onCloseAction={onCloseAction}
      title="Upravit člena kapely"
      submitLabel="Uložit změny"
      errorMessage="Nepodařilo se upravit člena kapely."
      successNotification="Člen kapely upraven"
      errorNotification="Chyba při úpravě člena kapely"
      initialValues={toMemberFormValues(member)}
      validate={memberFormValidate}
      fields={memberFormFields}
      onSubmitAction={async (values) =>
        updateMember(member.id, toMemberInput(values))
      }
    />
  );
}
