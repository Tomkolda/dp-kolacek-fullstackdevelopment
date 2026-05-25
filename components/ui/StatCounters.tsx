'use client';

import {Container, Grid, rem, Stack, Text} from '@mantine/core';
import {motion} from 'motion/react';

import {
  AnimatedCounter,
  type AnimatedCounterProps,
} from '@/components/ui/AnimatedCounter';

export type StatItem = {
  value: AnimatedCounterProps['value'];
  suffix?: string;
  description: string;
};

type StatCountersProps = {
  items: StatItem[];
};

/** Renders a responsive grid of animated stat counters. */
export const StatCounters = ({items}: StatCountersProps) => (
  <Container
    bg="var(--mantine-color-body)"
    py={{
      base: 'calc(var(--mantine-spacing-lg) * 4)',
      xs: 'calc(var(--mantine-spacing-lg) * 5)',
      lg: 'calc(var(--mantine-spacing-lg) * 6)',
    }}
    fluid>
    <Container size="lg">
      <Grid gutter="calc(var(--mantine-spacing-lg) * 4)" align="center">
        {items.map((item) => (
          <Grid.Col span={{base: 12, sm: 6, md: 3}} key={item.description}>
            <StatCell
              value={item.value}
              suffix={item.suffix}
              description={item.description}
            />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  </Container>
);

/** Renders a single animated stat cell with a counter value and description. */
const StatCell = ({
  value,
  suffix,
  description,
}: {
  value: AnimatedCounterProps['value'];
  suffix?: string;
  description: string;
}) => (
  <motion.div
    initial={{opacity: 0.0, scale: 0.9}}
    whileInView={{opacity: 1, scale: 1}}
    transition={{duration: 0.8, ease: 'easeInOut'}}
    viewport={{once: true}}>
    <Stack align="center" gap="xs">
      <AnimatedCounter
        ta="center"
        fz={rem(64)}
        fw="bold"
        value={value}
        suffix={suffix}
      />
      <Text fz="lg" ta="center" c="dimmed">
        {description}
      </Text>
    </Stack>
  </motion.div>
);
