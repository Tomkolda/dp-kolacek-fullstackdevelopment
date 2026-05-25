'use client';

import {Button, Collapse, PasswordInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useState} from 'react';

import {AuthLoginLink} from '@/app/(admin)/admin/_components/AuthLoginLink';
import {Alert} from '@/components/ui/Alert';
import {createClient} from '@/lib/supabase/client';
import {ensureMinDuration, nowMillis} from '@/lib/utils/datetime';

export function ResetPasswordPage({
  initialVerified,
  initialError,
}: {
  initialVerified: boolean;
  initialError: string | null;
}) {
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => {
        const v = value.trim();
        if (v.length < 10) return 'Heslo musí mít alespoň 10 znaků';
        if (/\s/.test(v)) return 'Heslo nesmí obsahovat mezery';

        const missing: string[] = [];
        if (!/[a-z]/.test(v)) missing.push('malé písmeno');
        if (!/[A-Z]/.test(v)) missing.push('velké písmeno');
        if (!/[0-9]/.test(v)) missing.push('číslo');

        if (missing.length > 0) {
          return `Heslo musí obsahovat: ${missing.join(', ')}`;
        }

        return null;
      },
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Hesla se neshodují',
    },
  });

  async function onSubmit(values: typeof form.values) {
    const password = values.password.trim();

    setIsLoading(true);
    setError(null);
    const startedAtMs = nowMillis();

    try {
      if (!initialVerified) {
        setError(
          'Odkaz pro nastavení nového hesla není platný nebo vypršel. Zkuste to znovu.',
        );
        return;
      }
      const supabase = createClient();
      const {error} = await supabase.auth.updateUser({password});
      await ensureMinDuration(startedAtMs);

      if (error) throw error;

      setSuccess(true);
      form.reset();
    } catch {
      // TODO: log error
      // todo: revize error hlasek
      setError('Změna hesla se nepodařila. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <ErrorAlert error={error} />
      <SuccessAlert success={success} />

      <Collapse in={initialVerified && !success}>
        <form
          onSubmit={form.onSubmit(onSubmit)}
          onChange={() => setError(null)}>
          <PasswordInput
            withAsterisk
            label="Nové heslo"
            placeholder="Zadejte nové heslo"
            required
            description="Heslo musí mít alespoň 10 znaků, malé, velké písmeno a číslo."
            radius="md"
            key={form.key('password')}
            {...form.getInputProps('password')}
          />

          <PasswordInput
            withAsterisk
            label="Potvrdit nové heslo"
            placeholder="Zadejte heslo znovu"
            required
            radius="md"
            mt="md"
            key={form.key('confirmPassword')}
            {...form.getInputProps('confirmPassword')}
          />

          <Button
            fullWidth
            mt="xl"
            mb="xl"
            radius="md"
            type="submit"
            loading={isLoading}
            disabled={isLoading}>
            {isLoading ? 'Ukládám…' : 'Změnit heslo'}
          </Button>

          <AuthLoginLink />
        </form>
      </Collapse>

      <Collapse in={!initialVerified && !success}>
        <AuthLoginLink />
      </Collapse>
    </>
  );
}

function ErrorAlert({error}: {error: string | null}) {
  return (
    <Collapse in={!!error}>
      <Alert
        severity="error"
        {...(error && {title: error})}
        styles={{mb: 'sm'}}
      />
    </Collapse>
  );
}

function SuccessAlert({success}: {success: boolean}) {
  return (
    <Collapse in={success}>
      <Alert
        severity="success"
        title="Heslo bylo úspěšně změněno."
        styles={{mb: 'lg'}}
      />
      <AuthLoginLink />
    </Collapse>
  );
}
