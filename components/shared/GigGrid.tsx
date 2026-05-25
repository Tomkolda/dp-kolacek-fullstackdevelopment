'use client';

import {
  Anchor,
  AspectRatio,
  Box,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Stack,
  Text,
} from '@mantine/core';
import {IconBrandFacebook, IconMapPin} from '@tabler/icons-react';
import {type HTMLMotionProps, motion} from 'motion/react';

import type {DBGig} from '@/db/types';
import {formatDate, formatTime} from '@/lib/utils/datetime';
import {formatPrice} from '@/lib/utils/utilsClient';

type GigCellProps = {
  gig: DBGig;
} & HTMLMotionProps<'div'>;

/** Renders a single gig card with image, date, location and links. */
const GigCell = ({gig, ...props}: GigCellProps) => {
  const dateTime = [
    formatDate(gig.date, 'ccc d.M.yyyy'),
    formatTime(gig.startTime),
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <motion.div
      whileHover={{scale: 1.02, boxShadow: 'var(--mantine-shadow-xl)'}}
      transition={{type: 'spring', stiffness: 300, damping: 20}}
      {...props}
      style={{borderRadius: 'var(--mantine-radius-lg)', ...props.style}}>
      <Card h="100%" withBorder>
        <Card.Section>
          <AspectRatio ratio={16 / 9}>
            {gig.image ? (
              <Image
                src={gig.image}
                alt={gig.title}
                h="100%"
                fit="contain"
                bg="var(--mantine-color-gray-1)"
                fallbackSrc="https://placehold.co/400x200?text=Koncert"
              />
            ) : (
              <Box
                w="100%"
                h="100%"
                bg="var(--mantine-color-gray-2)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text c="dimmed" size="sm">
                  Bez obrázku
                </Text>
              </Box>
            )}
          </AspectRatio>
        </Card.Section>
        <Stack gap={4} p="md">
          <Text fz="md" fw={600} tt="uppercase">
            {dateTime}
          </Text>
          {gig.city && (
            <Text fz="xl" fw={700} tt="uppercase">
              {gig.city}
            </Text>
          )}
          {gig.location && (
            <Text fz="sm" c="dimmed" tt="uppercase">
              {gig.location}
            </Text>
          )}
          <Text fz="sm" c="dimmed" mt={4} lineClamp={2}>
            {gig.title}
          </Text>
          <Text fz="sm" c="dimmed">
            {formatPrice(gig.price)}
          </Text>
          {(gig.facebookLink || gig.mapLink) && (
            <Group gap="sm" mt="xs">
              {gig.facebookLink && (
                <Anchor
                  href={gig.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  c="blue"
                  style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <IconBrandFacebook size={18} />
                  <Text size="sm">Facebook</Text>
                </Anchor>
              )}
              {gig.mapLink && (
                <Anchor
                  href={gig.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  c="red"
                  style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <IconMapPin size={18} />
                  <Text size="sm">Mapa</Text>
                </Anchor>
              )}
            </Group>
          )}
        </Stack>
      </Card>
    </motion.div>
  );
};

type GigGridProps = {
  gigs: DBGig[];
};

/** Displays a responsive grid of gig cards. */
export const GigGrid = ({gigs}: GigGridProps) => (
  <Container
    py={{
      base: 'calc(var(--mantine-spacing-lg) * 2)',
      xs: 'calc(var(--mantine-spacing-lg) * 3)',
      lg: 'calc(var(--mantine-spacing-lg) * 4)',
    }}
    fluid>
    <Container size="xl">
      <Grid gutter="md">
        {gigs.map((gig) => (
          <Grid.Col key={gig.id} span={{base: 12, sm: 6, md: 4}}>
            <GigCell gig={gig} />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  </Container>
);
