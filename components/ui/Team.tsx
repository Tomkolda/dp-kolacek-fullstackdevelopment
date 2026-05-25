'use client';

import {
  Box,
  Container,
  Grid,
  Image,
  Text,
  useMantineTheme,
} from '@mantine/core';
import {motion} from 'motion/react';
import NextImage from 'next/image';

import {JumboTitle} from '@/components/ui/JumboTitle';

export type BandMember = {
  name: string;
  location: string;
  role: string;
  imageUrl?: string;
  alt?: string;
};

type TeamGridProps = {
  members: BandMember[];
};

/** Renders a single band member card with optional image, name, location and role. */
const BandMemberCell = ({
  name,
  location,
  role,
  imageUrl,
  alt,
  index,
}: BandMember & {
  index: number;
}) => {
  const theme = useMantineTheme();

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      viewport={{once: true}}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: 0.2 * index,
          ease: 'easeOut',
        },
      }}>
      <Box w="100%" mb="xl" ta="center">
        {imageUrl && (
          <motion.div
            whileHover={{scale: 1.05, boxShadow: 'var(--mantine-shadow-xl)'}}
            transition={{type: 'spring'}}>
            <Box
              pos="relative"
              w="100%"
              style={{
                aspectRatio: '1/1',
                borderRadius: 'var(--mantine-radius-lg)',
              }}
              mb="lg">
              <Image
                mb="lg"
                component={NextImage}
                radius="lg"
                src={imageUrl}
                alt={alt || name}
                sizes={`(max-width: ${theme.breakpoints.xs}) 100vw, (max-width: ${theme.breakpoints.md}) 50vw, 33vw`}
                fill
              />
            </Box>
          </motion.div>
        )}
        <Text fz="xl" fw="bold">
          {name}
        </Text>
        <Text fz="lg" c="dimmed">
          {location}
        </Text>
        <Text fz="md" mt="xs">
          - {role} -
        </Text>
      </Box>
    </motion.div>
  );
};

/** Displays the band lineup section with a title, subtitle and a responsive member grid. */
export const TeamGrid = ({members}: TeamGridProps) => (
  <Container
    bg="var(--mantine-color-body)"
    size="xl"
    px={0}
    py={{
      base: 'calc(var(--mantine-spacing-lg) * 4)',
      xs: 'calc(var(--mantine-spacing-lg) * 5)',
      lg: 'calc(var(--mantine-spacing-lg) * 6)',
    }}>
    <Container
      size="lg"
      px={{
        base: 'xl',
        lg: 0,
      }}>
      <motion.div
        initial={{opacity: 0.0, y: 40}}
        whileInView={{opacity: 1, y: 0}}
        transition={{duration: 0.8, ease: 'easeInOut'}}
        viewport={{once: true}}>
        <JumboTitle
          order={2}
          fz="md"
          style={{textWrap: 'balance'}}
          ta="center"
          mb="xs">
          SESTAVA
        </JumboTitle>
        <Text
          c="dimmed"
          fz="lg"
          ta="center"
          mb={{
            base: 'calc(var(--mantine-spacing-xl) * 2)',
            lg: 'calc(var(--mantine-spacing-xl) * 3)',
          }}>
          od roku 2025
        </Text>
      </motion.div>
      <Box
        mt={{
          base: 'calc(var(--mantine-spacing-xl) * 2)',
          lg: 'calc(var(--mantine-spacing-xl) * 3)',
        }}>
        <Grid gutter="xl">
          {members.map((member, index) => (
            <Grid.Col span={{base: 12, xs: 6, md: 4}} key={member.name}>
              <BandMemberCell {...member} index={index} />
            </Grid.Col>
          ))}
        </Grid>
      </Box>
    </Container>
  </Container>
);
