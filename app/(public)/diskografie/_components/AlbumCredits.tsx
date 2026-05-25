import {Paper, SimpleGrid, Stack, Text, Title} from '@mantine/core';

type AlbumCreditsProps = {
  producedBy: string | null;
  mixedBy: string | null;
  recordedBy: string | null;
};

const CREDIT_FIELDS: Array<{key: keyof AlbumCreditsProps; label: string}> = [
  {key: 'producedBy', label: 'Producent'},
  {key: 'mixedBy', label: 'Mix'},
  {key: 'recordedBy', label: 'Nahrávání'},
];

export function AlbumCredits(props: AlbumCreditsProps) {
  const visibleCredits = CREDIT_FIELDS.filter((field) => props[field.key]);
  if (visibleCredits.length === 0) return null;

  return (
    <Paper withBorder radius="lg" p="md">
      <Stack gap={6}>
        <Title order={4}>Credits</Title>
        <SimpleGrid cols={{base: 1, sm: 2}} spacing="sm">
          {visibleCredits.map((field) => (
            <Text key={field.key} size="sm">
              <Text span fw={600}>
                {field.label}:
              </Text>{' '}
              {props[field.key]}
            </Text>
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
