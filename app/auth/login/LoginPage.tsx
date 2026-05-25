'use client';

import {
  Anchor,
  Button,
  Checkbox,
  Collapse,
  Container,
  Group,
  Paper,
  PasswordInput,
  TextInput,
} from '@mantine/core';
import {isEmail, useForm} from '@mantine/form';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {Alert} from '@/components/ui/Alert';
import {Logo} from '@/components/ui/Logo';
import {createClient} from '@/lib/supabase/client';
import {ensureMinDuration, nowMillis} from '@/lib/utils/datetime';

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      remember: true,
    },
    validate: {
      email: isEmail('Neplatný e-mail'),
      password: (value) => (value.trim().length > 0 ? null : 'Zadejte heslo'),
    },
  });

  async function onSubmit(values: typeof form.values) {
    const email = values.email.trim();
    const {password, remember} = values;

    setIsLoading(true);
    setError(null);
    const startedAtMs = nowMillis();

    try {
      const supabase = createClient({storage: remember ? 'local' : 'session'});
      const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      await ensureMinDuration(startedAtMs);

      if (error) throw error;

      router.refresh();
      router.replace('/admin');
    } catch {
      // TODO: log error
      setError('Přihlášení se nezdařilo');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container size={420} my={40}>
      <Logo width={240} height={60} />
      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
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

          <PasswordInput
            label="Heslo"
            placeholder="Vaše heslo"
            required
            mt="md"
            radius="md"
            key={form.key('password')}
            {...form.getInputProps('password')}
          />

          <Group justify="space-between" mt="lg">
            <Checkbox
              label="Zapamatuj si mě"
              key={form.key('remember')}
              {...form.getInputProps('remember', {type: 'checkbox'})}
            />
            <Anchor component={Link} href="/auth/forgot-password" size="sm">
              Zapomněli jste heslo?
            </Anchor>
          </Group>

          <Button
            fullWidth
            mt="xl"
            radius="md"
            type="submit"
            loading={isLoading}
            disabled={isLoading}>
            {isLoading ? 'Přihlašuji se...' : 'Přihlásit se'}
          </Button>
        </form>

        <Collapse in={!!error}>
          <Alert
            severity="error"
            title={error ?? ''}
            styles={{mb: 'sm', mt: 'xl'}}
          />
        </Collapse>
      </Paper>
      <Anchor component={Link} href="/" size="sm">
        Zpět na domovskou stránku
      </Anchor>{' '}
    </Container>
  );
}
