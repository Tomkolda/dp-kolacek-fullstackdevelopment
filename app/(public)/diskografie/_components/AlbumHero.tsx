import {
  Badge,
  Box,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import type {AlbumDetail} from '@/db/schema';
import {getImageUrl} from '@/lib/utils/getImageUrl';

import classes from './AlbumView.module.css';

type AlbumHeroProps = {
  detail: AlbumDetail;
};

export function AlbumHero({detail}: AlbumHeroProps) {
  return (
    <Paper withBorder radius="lg" p="md" className={classes.heroPanel}>
      <Group align="flex-start" gap="lg" className={classes.modalHero}>
        {detail.coverImage ? (
          <Image
            src={getImageUrl('albums', detail.coverImage)}
            alt={detail.title}
            w={220}
            h={220}
            radius="md"
            fit="cover"
            className={classes.heroCover}
            fallbackSrc="https://placehold.co/500x500?text=Album"
          />
        ) : (
          <Box className={classes.modalCoverFallback}>
            <Text c="dimmed" size="sm">
              Bez obalu
            </Text>
          </Box>
        )}

        <Stack gap="sm" className={classes.modalHeroText}>
          <Title order={3} className={classes.heroTitle}>
            {detail.title}
          </Title>
          <Group gap="xs" className={classes.metaBadges}>
            <Badge color="myColor" variant="filled">
              {detail.releaseDate.slice(0, 4)}
            </Badge>
            {detail.genre ? (
              <Badge color="myColor" variant="light">
                {detail.genre}
              </Badge>
            ) : null}
            {detail.label ? (
              <Badge color="myColor" variant="light">
                {detail.label}
              </Badge>
            ) : null}
          </Group>
          {detail.description ? (
            <Text size="sm" className={classes.description}>
              {detail.description}
            </Text>
          ) : null}
        </Stack>
      </Group>
    </Paper>
  );
}
