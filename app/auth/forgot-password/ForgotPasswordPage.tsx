'use client';

import {
  Button,
  Collapse,
  Container,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {isEmail, useForm} from '@mantine/form';
import {useState} from 'react';

import {AuthLoginLink} from '@/app/(admin)/admin/_components/AuthLoginLink';
import {Alert} from '@/components/ui/Alert';
import {Logo} from '@/components/ui/Logo';
import {ensureMinDuration, nowMillis} from '@/lib/utils/datetime';

import classes from './ForgotPasswordPage.module.css';

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: {
      email: isEmail('Neplatný e-mail'),
    },
  });

  async function onSubmit(values: typeof form.values) {
    const email = values.email.trim();

    setIsLoading(true);
    setError(null);
    const startedAtMs = nowMillis();

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({email}),
      });
      await ensureMinDuration(startedAtMs);

      if (!res.ok) throw new Error('Request failed');

      setSuccess(true);
      form.reset();
    } catch {
      // TODO: log error
      setError('Došlo k neočekávané chybě');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container size={460} my={30}>
      <Logo width={240} height={60} />

      <Title mt="xl" ta="center" className={classes.title}>
        Zapomněli jste heslo?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Zadejte svůj e-mail a získejte odkaz na resetování hesla
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Collapse in={!!success}>
          <Alert
            severity="success"
            title="Odkaz na resetování hesla byl zaslán na váš e-mail."
            styles={{mb: 'xl', mt: 'lg'}}
          />
          <AuthLoginLink />
        </Collapse>
        <Collapse in={!success}>
          <form
            onSubmit={form.onSubmit(onSubmit)}
            onChange={() => setError(null)}>
            <TextInput
              withAsterisk
              label="Email"
              placeholder="vas@email.cz"
              required
              radius="md"
              key={form.key('email')}
              {...form.getInputProps('email')}
            />

            <Button
              fullWidth
              mt="xl"
              mb="xl"
              radius="md"
              type="submit"
              loading={isLoading}
              disabled={isLoading}>
              {isLoading ? 'Resetuji heslo...' : 'Resetovat heslo'}
            </Button>

            <AuthLoginLink />
          </form>

          <Collapse in={!!error}>
            <Alert
              severity="error"
              title={error ?? ''}
              styles={{mb: 'sm', mt: 'xl'}}
            />
          </Collapse>
        </Collapse>
      </Paper>
    </Container>
  );
}
