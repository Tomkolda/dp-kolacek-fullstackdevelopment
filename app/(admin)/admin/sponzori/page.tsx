import {Container, Stack} from '@mantine/core';

import {getSponsorsAdmin} from '@/lib/server/getSponsorsAdmin';

import {SponsorsTable} from './_components/SponsorsTable';

export default async function SponzoriPage() {
  const sponsors = await getSponsorsAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <SponsorsTable sponsors={sponsors} />
      </Container>
    </Stack>
  );
}
