'use client';

import {
  Anchor,
  Box,
  Container,
  Divider,
  Flex,
  Stack,
  Text,
} from '@mantine/core';
import NextLink from 'next/link';
import type {CSSProperties} from 'react';

import {Logo} from '@/components/ui/Logo';

import classes from './FooterGrid.module.css';

export type FooterSocialLink = {
  icon: string;
  href: string;
  label: string;
  iconColor?: string | null;
};

export type FooterNavLink = {
  href: string;
  label: string;
};

export type FooterNavGroup = {
  label: string;
  href?: string;
  links: readonly FooterNavLink[];
};

type FooterGridProps = {
  logoWidth?: number;
  logoHeight?: number;
  companyDescription?: string;
  navGroups?: readonly FooterNavGroup[];
  socialTitle?: string;
  socialLinks?: readonly FooterSocialLink[];
  copyrightText?: string;
};

export const FooterGrid = ({
  logoWidth = 140,
  logoHeight = 35,
  companyDescription,
  navGroups = [],
  socialTitle = 'Social',
  socialLinks = [],
  copyrightText = '© 2024 Titanium, Inc. All rights reserved.',
}: FooterGridProps) => (
  <Container component="footer" className={classes.container} fluid>
    <Container
      size="xl"
      px={0}
      py={{
        base: 'xl',
        sm: 'calc(var(--mantine-spacing-xl) * 2)',
      }}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap="xl">
        <Stack gap="xs">
          <Box>
            <Logo width={logoWidth} height={logoHeight} />
          </Box>
          {companyDescription && (
            <Text mt="xs" size="sm" c="dimmed" maw={300}>
              {companyDescription}
            </Text>
          )}
        </Stack>

        {navGroups.length > 0 && (
          <Flex className={classes.nav} gap="xl" wrap="wrap">
            {navGroups.map((group) => (
              <Stack
                key={`${group.label}-${group.href ?? 'group'}`}
                gap={6}
                className={classes.navGroup}>
                {group.label &&
                  (group.href ? (
                    <Anchor
                      component={NextLink}
                      href={group.href}
                      className={`${classes.navHeading} ${classes.navHeadingLink}`}
                      td="none">
                      {group.label}
                    </Anchor>
                  ) : (
                    <Text className={classes.navHeading}>{group.label}</Text>
                  ))}

                {group.links.length > 0 && (
                  <Stack gap={4} className={classes.navSubLinks}>
                    {group.links.map((link) => (
                      <Anchor
                        key={link.href}
                        component={NextLink}
                        href={link.href}
                        className={classes.navSubLink}
                        td="none">
                        {link.label}
                      </Anchor>
                    ))}
                  </Stack>
                )}
              </Stack>
            ))}
          </Flex>
        )}

        {socialLinks.length > 0 && (
          <Box>
            <Text fw="bold" mb="md">
              {socialTitle}
            </Text>
            <Box className={classes.socialList}>
              {socialLinks.map((link) => (
                <Anchor
                  component={NextLink}
                  key={link.href}
                  href={link.href}
                  aria-label={link.label}
                  className={classes.socialLink}
                  style={
                    {
                      '--social-icon-color':
                        link.iconColor ?? 'var(--mantine-color-blue-6)',
                      '--social-icon-mask': `url("${link.icon}")`,
                    } as CSSProperties
                  }>
                  <Box className={classes.socialIcon} aria-hidden="true" />
                </Anchor>
              ))}
            </Box>
          </Box>
        )}
      </Flex>

      <Divider mt="calc(var(--mantine-spacing-xl) * 2)" mb="xl" />

      <Text size="xs" c="dimmed">
        {copyrightText}
      </Text>
    </Container>
  </Container>
);
