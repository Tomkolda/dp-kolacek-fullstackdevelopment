'use client';

import {
  Alert,
  Avatar,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {isEmail, useForm} from '@mantine/form';
import {useRouter} from 'next/navigation';
import {useMemo, useState} from 'react';

import {createClient} from '@/lib/supabase/client';

type Props = {
  userId: string;
  email: string | null;
  createdAt?: string | null;
  lastSignInAt?: string | null;
  initialFullName?: string | null;
};

function getInitials(input: string) {
  const cleaned = input.trim();
  if (!cleaned) return '?';

  const base = cleaned.includes('@')
    ? (cleaned.split('@')[0] ?? cleaned)
    : cleaned;
  const parts = base
    .split(/[\s._-]+/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const first = parts[0]?.[0] ?? '';
  const second =
    parts.length >= 2 ? (parts[1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
  const letters = `${first}${second}`;

  return letters.toUpperCase() || '?';
}

export function UserProfileForm({
  userId,
  email,
  createdAt,
  lastSignInAt,
  initialFullName,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      fullName: initialFullName ?? '',
      email: email ?? '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      email: isEmail('Neplatný e-mail'),
      fullName: (value) =>
        value.trim().length === 0 || value.trim().length >= 2
          ? null
          : 'Jméno je příliš krátké',
      newPassword: (value) =>
        value.trim().length === 0 || value.trim().length >= 8
          ? null
          : 'Heslo musí mít alespoň 8 znaků',
      confirmPassword: (value, values) =>
        values.newPassword.trim().length === 0 || value === values.newPassword
          ? null
          : 'Hesla se neshodují',
    },
  });

  const avatarData = useMemo(() => {
    const currentEmail = form.getValues().email?.trim() || email || '';
    const name = form.getValues().fullName?.trim();
    return {
      initials: getInitials(name || currentEmail || 'Uživatel'),
    };
  }, [email, form]);

  async function onSubmit(values: typeof form.values) {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const supabase = createClient();
      const nextEmail = values.email.trim();

      const dataUpdates: Record<string, unknown> = {
        full_name: values.fullName.trim() || null,
      };

      const payload: {
        email?: string;
        password?: string;
        data?: Record<string, unknown>;
      } = {data: dataUpdates};

      if (email && nextEmail !== email) {
        payload.email = nextEmail;
      }

      if (values.newPassword.trim().length > 0) {
        payload.password = values.newPassword;
      }

      const isNoop =
        !payload.email &&
        !payload.password &&
        Object.values(dataUpdates).every((v) => v == null);

      if (isNoop) {
        setSuccess('Není co uložit (žádné změny).');
        return;
      }

      const {error} = await supabase.auth.updateUser(payload);
      if (error) throw error;

      setSuccess(
        [
          'Změny byly uloženy.',
          payload.email
            ? 'Pokud měníte e-mail, obvykle je potřeba potvrdit změnu přes odkaz v e-mailu.'
            : null,
        ]
          .filter(Boolean)
          .join(' '),
      );

      form.setFieldValue('newPassword', '');
      form.setFieldValue('confirmPassword', '');
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Došlo k neočekávané chybě');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1}>Účet</Title>
          <Text c="dimmed" size="sm">
            ID: {userId}
          </Text>
          {createdAt ? (
            <Text c="dimmed" size="sm">
              Vytvořeno: {new Date(createdAt).toLocaleString('cs-CZ')}
            </Text>
          ) : null}
          {lastSignInAt ? (
            <Text c="dimmed" size="sm">
              Poslední přihlášení:{' '}
              {new Date(lastSignInAt).toLocaleString('cs-CZ')}
            </Text>
          ) : null}
        </div>
        <Avatar
          radius="xl"
          size={56}
          styles={{
            root: {
              backgroundColor: 'var(--mantine-color-myColor-7)',
              color: 'white',
              fontWeight: 700,
            },
          }}>
          {avatarData.initials}
        </Avatar>
      </Group>

      {error ? (
        <Alert color="red" title="Chyba">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert color="green" title="Hotovo">
          {success}
        </Alert>
      ) : null}

      <Paper withBorder p="md" radius="md">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="md">
            <Title order={3}>Profil</Title>

            <TextInput
              label="Jméno"
              placeholder="Např. Marek"
              key={form.key('fullName')}
              {...form.getInputProps('fullName')}
            />

            <Divider />

            <Title order={3}>Přihlašování</Title>

            <TextInput
              withAsterisk
              label="E-mail"
              placeholder="vas@email.cz"
              key={form.key('email')}
              {...form.getInputProps('email')}
            />

            <Group grow align="flex-start">
              {/* možna využit na heslo /auth/reset-password */}
              <PasswordInput
                label="Nové heslo"
                placeholder="Nechte prázdné, pokud neměníte"
                key={form.key('newPassword')}
                {...form.getInputProps('newPassword')}
              />
              <PasswordInput
                label="Potvrzení nového hesla"
                placeholder="Znovu nové heslo"
                key={form.key('confirmPassword')}
                {...form.getInputProps('confirmPassword')}
              />
            </Group>

            <Group justify="flex-end">
              <Button type="submit" loading={isSaving} disabled={isSaving}>
                Uložit změny
              </Button>
            </Group>

            <Text c="dimmed" size="xs">
              Doporučení: pro změnu e-mailu/hesla je dobré mít zapnuté ověřování
              e-mailu a případně 2FA v Supabase.
            </Text>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
