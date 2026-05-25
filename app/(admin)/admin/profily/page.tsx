import {Container, Stack} from '@mantine/core';

import {getProfilesAdmin} from '@/lib/server/getProfilesAdmin';

import {ProfilesTable} from './_components/ProfilesTable';

export default async function ProfilyPage() {
  const profiles = await getProfilesAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <ProfilesTable profiles={profiles} />
      </Container>
    </Stack>
  );
}
