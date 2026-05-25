import {Image, Paper, SimpleGrid, Stack, Title} from '@mantine/core';

import {getImageUrl} from '@/lib/utils/getImageUrl';

type AlbumBookletProps = {
  title: string;
  bookletImages: string[];
};

export function AlbumBooklet({title, bookletImages}: AlbumBookletProps) {
  if (bookletImages.length === 0) return null;

  return (
    <Paper withBorder radius="lg" p="md">
      <Stack gap="sm">
        <Title order={4}>Booklet</Title>
        <SimpleGrid cols={{base: 1, sm: 2, md: 3}} spacing="sm">
          {bookletImages.map((imagePath, index) => (
            <Image
              key={`${imagePath}-${index}`}
              src={getImageUrl('albums', imagePath)}
              alt={`${title} booklet ${index + 1}`}
              radius="md"
              h={160}
              fit="cover"
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
