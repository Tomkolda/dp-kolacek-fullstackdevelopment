import {Container, Stack} from '@mantine/core';

import {getLinkRedirectsAdmin} from '@/lib/server/getLinkRedirectsAdmin';

import {RedirectsTable} from './_components/RedirectsTable';

export default async function LinkRedirectorPage() {
  const redirects = await getLinkRedirectsAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <RedirectsTable redirects={redirects} />
      </Container>
    </Stack>
  );
}
