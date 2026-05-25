import {Badge, Box, Card, CardSection, Image, Text} from '@mantine/core';

import classes from './AlbumView.module.css';

type AlbumCardProps = {
  title: string;
  releaseYear: string;
  coverImageUrl: string | null;
  onClick: () => void;
};

export function AlbumCard({
  title,
  releaseYear,
  coverImageUrl,
  onClick,
}: AlbumCardProps) {
  return (
    <Card
      component="button"
      type="button"
      withBorder
      h="100%"
      radius="xl"
      className={classes.albumCard}
      onClick={onClick}
      aria-label={`Zobrazit detail alba ${title}`}>
      <CardSection className={classes.mediaSection}>
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            h={320}
            fit="cover"
            className={classes.coverImage}
            fallbackSrc="https://placehold.co/600x600?text=Album"
          />
        ) : (
          <Box h={320} className={classes.coverFallback}>
            <Text c="dimmed" size="sm">
              Bez obalu
            </Text>
          </Box>
        )}
      </CardSection>
      <Badge
        variant="filled"
        color="dark"
        radius="xl"
        className={classes.yearBadge}>
        {releaseYear}
      </Badge>
    </Card>
  );
}
