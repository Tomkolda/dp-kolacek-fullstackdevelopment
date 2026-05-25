'use client';

import {
  Alert,
  Button,
  Card,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconBrandFacebook, IconInfoCircle} from '@tabler/icons-react';
import {useRouter} from 'next/navigation';
import {useCallback, useState} from 'react';

import type {FbNewsWebItemValue} from '@/db/types';
import {upsertWebItem} from '@/lib/server/upsertWebItem';

type FbNewsSettingsCardProps = {
  initialVisible: boolean;
  initialLimit: number;
};

type FormValues = {
  visible: boolean;
  limit: number | string;
};

export function FbNewsSettingsCard({
  initialVisible,
  initialLimit,
}: FbNewsSettingsCardProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      visible: initialVisible,
      limit: initialLimit,
    },
    validate: {
      limit: (value) => {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1 || n > 10) {
          return 'Počet příspěvků musí být celé číslo 1–10.';
        }
        return null;
      },
    },
  });

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setError(null);
      setIsSaving(true);

      try {
        const webItemValue: FbNewsWebItemValue = {
          type: 'fb_news',
          visible: values.visible,
          limit: Number(values.limit),
        };

        const result = await upsertWebItem({
          key: 'fb_news',
          value: webItemValue,
        });

        if (!result.success) {
          setError(result.error);
          notifications.show({
            color: 'red',
            title: 'Chyba',
            message: 'Nepodařilo se uložit nastavení.',
          });
          return;
        }

        router.refresh();
        notifications.show({
          color: 'green',
          title: 'Hotovo',
          message: 'Nastavení Facebook novinky uloženo.',
        });
      } catch {
        setError('Nepodařilo se uložit nastavení.');
      } finally {
        setIsSaving(false);
      }
    },
    [router],
  );

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group mb="md" gap="sm">
        <IconBrandFacebook size={24} />
        <Title order={4}>Facebook novinky</Title>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        Zobrazí poslední příspěvky z Facebook stránky v sekci Novinky na
        homepage.
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <NumberInput
            label="Počet příspěvků"
            description="Kolik posledních příspěvků zobrazit (1–10)"
            min={1}
            max={10}
            key={form.key('limit')}
            {...form.getInputProps('limit')}
          />

          <Switch
            label="Zobrazit sekci novinky na homepage"
            key={form.key('visible')}
            {...form.getInputProps('visible', {type: 'checkbox'})}
          />

          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light">
            Pro fungování je potřeba nastavit proměnné prostředí{' '}
            <Text component="span" fw={600} size="sm">
              FB_PAGE_ID
            </Text>{' '}
            a{' '}
            <Text component="span" fw={600} size="sm">
              FB_PAGE_TOKEN
            </Text>{' '}
            v souboru .env.local.
          </Alert>

          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <Group justify="flex-end">
            <Button type="submit" loading={isSaving}>
              Uložit nastavení
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
