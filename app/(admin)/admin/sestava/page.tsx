import {Container, Stack} from '@mantine/core';

import {getMembersAdmin} from '@/lib/server/getMembersAdmin';

import {MembersTable} from './_components/MembersTable';

export default async function SestavaPage() {
  const members = await getMembersAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <MembersTable members={members} />
      </Container>
    </Stack>
  );
}
