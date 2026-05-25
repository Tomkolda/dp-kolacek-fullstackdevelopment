import {
  AspectRatio,
  Box,
  Card,
  CardSection,
  Image,
  Loader,
  Overlay,
  Text,
} from '@mantine/core';

import classes from './GalleryCard.module.css';

type GalleryCardProps = {
  title: string;
  coverImageUrl: string | null;
  loading?: boolean;
  onClick?: () => void;
};

export function GalleryCard({
  title,
  coverImageUrl,
  loading,
  onClick,
}: GalleryCardProps) {
  return (
    <Card
      withBorder
      h="100%"
      radius="xl"
      className={classes.galleryCard}
      style={onClick ? {cursor: 'pointer'} : undefined}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }>
      <CardSection className={classes.mediaSection}>
        <AspectRatio ratio={16 / 9}>
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              h="100%"
              fit="contain"
              bg="var(--mantine-color-gray-1)"
              className={classes.coverImage}
              fallbackSrc="https://placehold.co/600x400?text=Foto"
            />
          ) : (
            <Box w="100%" h="100%" className={classes.coverFallback}>
              <Text c="dimmed" size="sm">
                Bez fotky
              </Text>
            </Box>
          )}
        </AspectRatio>
      </CardSection>
      <Text fw={600} size="md" mt="sm" px="md" pb="md" lineClamp={2}>
        {title}
      </Text>
      {loading && (
        <Overlay center backgroundOpacity={0.35} blur={2} radius="xl">
          <Loader size="sm" />
        </Overlay>
      )}
    </Card>
  );
}
