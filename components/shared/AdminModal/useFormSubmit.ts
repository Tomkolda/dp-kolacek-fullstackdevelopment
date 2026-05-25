'use client';

import {notifications} from '@mantine/notifications';
import {useRouter} from 'next/navigation';
import {useCallback, useState} from 'react';

import {ensureMinDuration, nowMillis} from '@/lib/utils/datetime';

export type ActionResult = {success: true} | {success: false; error: string};

type UseFormSubmitOptions = {
  onCloseAction: () => void;
  onResetAction: () => void;
  errorMessage?: string;
  successNotification?: string;
  errorNotification?: string;
};

export function useFormSubmit({
  onCloseAction,
  onResetAction,
  errorMessage = 'Nepodařilo se provést akci.',
  successNotification,
  errorNotification,
}: UseFormSubmitOptions) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = useCallback(() => {
    if (isSaving) return;
    onResetAction();
    setError(null);
    onCloseAction();
  }, [isSaving, onResetAction, onCloseAction]);

  const handleSubmit = useCallback(
    async (action: () => Promise<ActionResult>) => {
      setError(null);
      setIsSaving(true);
      const startedAt = nowMillis();

      try {
        const result = await action();

        if (!result.success) {
          setError(result.error);
          if (errorNotification) {
            notifications.show({
              color: 'red',
              title: 'Chyba',
              message: errorNotification,
            });
          }
          return;
        }

        onResetAction();
        setError(null);
        onCloseAction();
        router.refresh();
        if (successNotification) {
          notifications.show({
            color: 'green',
            title: 'Hotovo',
            message: successNotification,
          });
        }
      } catch {
        setError(errorMessage);
        if (errorNotification) {
          notifications.show({
            color: 'red',
            title: 'Chyba',
            message: errorNotification,
          });
        }
      } finally {
        try {
          await ensureMinDuration(startedAt);
        } finally {
          setIsSaving(false);
        }
      }
    },
    [
      onResetAction,
      onCloseAction,
      router,
      errorMessage,
      successNotification,
      errorNotification,
    ],
  );

  return {isSaving, error, handleSubmit, handleClose} as const;
}
