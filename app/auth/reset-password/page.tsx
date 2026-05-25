import {Container, Paper, Text, Title} from '@mantine/core';
import {redirect} from 'next/navigation';

import {Logo} from '@/components/ui/Logo';
import {createClient} from '@/lib/supabase/server';

import {ResetPasswordPage} from './ResetPasswordPage';
import classes from './ResetPasswordPage.module.css';

type SearchParams = {
  token_hash?: string;
  type?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Pokud někdo přijde rovnou na /auth/reset-password s tokenem,
  // přesměrujeme ho na serverovou validaci, která nastaví session do cookies.
  if (params.token_hash && params.type) {
    const qs = new URLSearchParams();
    qs.set('token_hash', params.token_hash);
    qs.set('type', params.type);
    qs.set('next', '/auth/reset-password');
    redirect(`/auth/confirm?${qs.toString()}`);
  }

  const supabase = await createClient();
  const {data} = await supabase.auth.getClaims();
  const isVerified = !!data?.claims;

  return (
    <Container size={460} my={30}>
      <Logo width={240} height={60} />

      <Title ta="center" className={classes.title}>
        Nastavit nové heslo
      </Title>

      <Text c="dimmed" fz="sm" ta="center">
        Zadejte nové heslo pro svůj účet.
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <ResetPasswordPage
          initialVerified={isVerified}
          initialError={
            isVerified
              ? null
              : 'Odkaz pro nastavení nového hesla není platný nebo vypršel. Požádejte si prosím o nový reset hesla.'
          }
        />
      </Paper>
    </Container>
  );
}
