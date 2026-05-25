import {Container, Stack, Title} from '@mantine/core';

import {getWebItemByKey} from '@/lib/server/getWebItem';

import {FbNewsSettingsCard} from './_components/FbNewsSettingsCard';

export default async function NastaveniWebuPage() {
  const fbNews = await getWebItemByKey('fb_news');

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="sm" w="100%">
        <Title order={2} mb="lg">
          Nastavení webu
        </Title>

        <FbNewsSettingsCard
          initialVisible={fbNews?.visible ?? false}
          initialLimit={fbNews?.limit ?? 4}
        />
      </Container>
    </Stack>
  );
}
