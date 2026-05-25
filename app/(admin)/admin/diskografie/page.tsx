import {Container, Stack} from '@mantine/core';

import {getAlbumsAdmin} from '@/lib/server/getAlbumsAdmin';

import {AlbumsTable} from './_components/AlbumsTable';

export default async function DiskografiePage() {
  const albums = await getAlbumsAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <AlbumsTable albums={albums} />
      </Container>
    </Stack>
  );
}
