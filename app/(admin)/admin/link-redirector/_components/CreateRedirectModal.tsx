'use client';

import {Form} from '@/components/shared/AdminModal/Form';
import {createLinkRedirect} from '@/lib/server/createLinkRedirect';

import {
  initialRedirectFormValues,
  redirectFormFields,
  redirectFormValidate,
  toRedirectInput,
} from './redirectForm';

type CreateRedirectModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateRedirectModal({
  opened,
  onCloseAction,
}: CreateRedirectModalProps) {
  return (
    <Form
      opened={opened}
      onCloseAction={onCloseAction}
      title="Nový redirect"
      submitLabel="Vytvořit redirect"
      errorMessage="Nepodařilo se vytvořit redirect."
      successNotification="Redirect vytvořen"
      errorNotification="Chyba při vytváření redirectu"
      initialValues={initialRedirectFormValues}
      validate={redirectFormValidate}
      fields={redirectFormFields}
      onSubmitAction={async (values) =>
        createLinkRedirect(toRedirectInput(values))
      }
    />
  );
}
