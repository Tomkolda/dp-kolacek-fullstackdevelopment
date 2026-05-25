'use client';

import {Box, Tabs, Title} from '@mantine/core';
import {IconPhoto, IconTable} from '@tabler/icons-react';

import type {AdminGallery} from '@/lib/server/getGalleriesAdmin';

import {GalleriesTable} from './GalleriesTable';
import {StorageBrowser} from './StorageBrowser';

type FotogalerieContentProps = {
  galleries: AdminGallery[];
};

export function FotogalerieContent({galleries}: FotogalerieContentProps) {
  return (
    <Box>
      <Title order={2} mb="md">
        Fotogalerie
      </Title>
      <Tabs defaultValue="galleries">
        <Tabs.List mb="md">
          <Tabs.Tab value="galleries" leftSection={<IconTable size={16} />}>
            Galerie
          </Tabs.Tab>
          <Tabs.Tab value="storage" leftSection={<IconPhoto size={16} />}>
            Fotky v úložišti
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="galleries">
          <GalleriesTable galleries={galleries} />
        </Tabs.Panel>

        <Tabs.Panel value="storage">
          <StorageBrowser />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
