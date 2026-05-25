'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {createMember} from '@/lib/server/createMember';

import {
  initialMemberFormValues,
  memberFormFields,
  memberFormValidate,
  toMemberInput,
} from './memberForm';

type CreateMemberModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateMemberModal({
  opened,
  onCloseAction,
}: CreateMemberModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nový člen kapely"
      submitLabel="Vytvořit člena"
      errorMessage="Nepodařilo se vytvořit člena kapely."
      successNotification="Člen kapely vytvořen"
      errorNotification="Chyba při vytváření člena kapely"
      initialValues={initialMemberFormValues}
      validate={memberFormValidate}
      fields={memberFormFields}
      onSubmitAction={async (values) => createMember(toMemberInput(values))}
    />
  );
}
