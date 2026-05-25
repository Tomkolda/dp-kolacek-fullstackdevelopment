import {
  Box,
  Container,
  type ContainerProps,
  Flex,
  Text,
  type TextProps,
} from '@mantine/core';
import Image from 'next/image';

import {Marquee} from '@/components/ui/Marquee';

import classes from './AnimatedLogos.module.css';

const SECONDS_PER_ITEM = 3;
const LOGO_HEIGHT_PX = 64;
const LOGO_WIDTH_HINT_PX = 240;

type LogoItem = {
  id: number;
  name: string;
  image: string;
  link: string;
  logoScale?: number | null;
  logoTranslateY?: number | null;
};

type LogoOverride = {
  scale?: number;
  translateY?: number;
};

type Props = ContainerProps & {
  items: LogoItem[];
  title?: string;
  titleProps?: TextProps;
  duration?: number;
  gap?: string | number;
  logoHeight?: number;
  logoOverrides?: Partial<Record<string, LogoOverride>>;
};

export const AnimatedLogos = ({
  title,
  items,
  titleProps,
  duration,
  gap = 'calc(var(--mantine-spacing-lg) * 2)',
  logoHeight = LOGO_HEIGHT_PX,
  logoOverrides,
  className,
  ...containerProps
}: Props) => (
  <Box className={className}>
    <Container
      pt={{
        base: 'calc(var(--mantine-spacing-lg) * 1)',
        xs: 'calc(var(--mantine-spacing-lg) * 2)',
        lg: 'calc(var(--mantine-spacing-lg) * 3)',
      }}
      pb="md"
      size="xl"
      {...containerProps}>
      {title && (
        <Text fz="lg" ta="center" fw={600} c="dimmed" {...titleProps}>
          {title}
        </Text>
      )}
    </Container>
    <Box className={classes.root}>
      <Container
        py={{
          base: 'md',
          xs: 'lg',
        }}
        size="xl">
        <Marquee
          items={getLogoItems(items, logoHeight, logoOverrides)}
          gap={gap}
          duration={duration ?? items.length * SECONDS_PER_ITEM}
        />
      </Container>
    </Box>
  </Box>
);

function getLogoItems(
  items: LogoItem[],
  logoHeight: number,
  logoOverrides?: Partial<Record<string, LogoOverride>>,
) {
  return items.map((item) => {
    const override = logoOverrides?.[item.name];
    const scale = override?.scale ?? item.logoScale ?? 1;
    const translateY = override?.translateY ?? item.logoTranslateY ?? 0;
    const scaledHeight = `${scale * 100}%`;

    return (
      <Flex
        key={item.id}
        component="a"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        align="center"
        justify="center"
        h={logoHeight}
        className={classes.logoItem}>
        <Image
          src={item.image}
          alt={item.name}
          width={LOGO_WIDTH_HINT_PX}
          height={logoHeight}
          loading="eager"
          decoding="async"
          unoptimized
          sizes={`${LOGO_WIDTH_HINT_PX}px`}
          className={classes.logoImage}
          style={{
            width: 'auto',
            height: scaledHeight,
            transform: `translateY(${translateY}px)`,
          }}
        />
      </Flex>
    );
  });
}
