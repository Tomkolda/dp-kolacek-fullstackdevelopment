'use client';

import {Anchor, useMantineColorScheme} from '@mantine/core';
import Image from 'next/image';
import NextLink from 'next/link';

import {useLogoImageUrl} from '@/components/ui/LogoImageProvider';

import classes from './Logo.module.css';

type LogoProps = {
  width?: number;
  height?: number;
  forceLight?: boolean;
  imageUrl?: string | null;
};

export function Logo({
  width = 120,
  height = 30,
  forceLight = false,
  imageUrl = null,
}: LogoProps) {
  const {colorScheme} = useMantineColorScheme();
  const contextImageUrl = useLogoImageUrl();
  const src =
    imageUrl ||
    (forceLight
      ? contextImageUrl?.light
      : colorScheme === 'dark'
        ? contextImageUrl?.light
        : contextImageUrl?.dark);
  if (!src) return null;

  return (
    <Anchor component={NextLink} href="/" td="none" aria-label="Free Fall">
      <Image
        src={src}
        alt="Free Fall logo"
        width={width}
        height={height}
        priority
        className={classes.logo}
      />
    </Anchor>
  );
}
