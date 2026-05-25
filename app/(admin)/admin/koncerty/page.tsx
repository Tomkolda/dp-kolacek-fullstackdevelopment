import {Container, Stack} from '@mantine/core';

import {getGigsAdmin} from '@/lib/server/getGigsAdmin';

import {GigsTable} from './_components/GigsTable';

export default async function KoncertyPage() {
  const gigs = await getGigsAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <GigsTable gigs={gigs} />
      </Container>
    </Stack>
  );
}
