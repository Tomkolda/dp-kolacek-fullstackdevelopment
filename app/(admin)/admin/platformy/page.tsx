import {Container, Stack} from '@mantine/core';

import {getPlatformsAdmin} from '@/lib/server/getPlatformsAdmin';

import {PlatformsTable} from './_components/PlatformsTable';

export default async function PlatformyPage() {
  const platforms = await getPlatformsAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <PlatformsTable platforms={platforms} />
      </Container>
    </Stack>
  );
}
