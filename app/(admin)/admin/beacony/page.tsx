import {Container, Stack} from '@mantine/core';

import {getBeaconsAdmin} from '@/lib/server/getBeaconsAdmin';

import {BeaconsTable} from './_components/BeaconsTable';

export default async function BeaconyPage() {
  const beacons = await getBeaconsAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <BeaconsTable beacons={beacons} />
      </Container>
    </Stack>
  );
}
