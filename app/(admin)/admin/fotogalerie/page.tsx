import {Container, Stack} from '@mantine/core';

import {getGalleriesAdmin} from '@/lib/server/getGalleriesAdmin';

import {FotogalerieContent} from './_components/FotogalerieContent';

export default async function FotogaleriePage() {
  const galleries = await getGalleriesAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <FotogalerieContent galleries={galleries} />
      </Container>
    </Stack>
  );
}
