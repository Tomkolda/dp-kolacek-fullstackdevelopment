'use client';

import {
  Anchor,
  Burger,
  Button,
  Container,
  Drawer,
  Flex,
  Menu,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {IconArrowRight} from '@tabler/icons-react';
import {motion} from 'motion/react';
import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';

import {ColorSchemeButton} from '@/components/ui/ColorSchemeButton';
import {Logo} from '@/components/ui/Logo';

import classes from './Header.module.css';

type HeaderLinkLeaf = {label: string; href: string};
type HeaderLinkNode = HeaderLinkLeaf | {label: string; items: HeaderLinkLeaf[]};

const headerLinks: HeaderLinkNode[] = [
  {label: 'Koncerty', href: '/koncerty'},
  {
    label: 'Kapela',
    items: [
      {label: 'O Nás', href: '#about-us'},
      {label: 'Fotogalerie', href: '/fotogalerie'},
      {label: 'Videogalerie', href: '#videogallery'},
      {label: 'Diskografie', href: '/diskografie'},
      {label: 'Sestava', href: '#lineup'},
    ],
  },
  {label: 'Merch', href: '/merch'},
  {label: 'Kontakt', href: '#contact'},
  {label: 'Pro pořadatele', href: '#for-organizers'},
];

const breakpoint = 'sm';

/** Top-level header component that renders both desktop and mobile variants. */
export function Header({showAdmin}: {showAdmin?: boolean}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isOnHero, setIsOnHero] = useState(isHomePage);

  useEffect(() => {
    if (!isHomePage) {
      setIsOnHero(false);
      return;
    }

    const hero = document.getElementById('hero');
    if (!hero) {
      setIsOnHero(false);
      return;
    }

    setIsOnHero(hero.getBoundingClientRect().bottom > 80);
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIsOnHero = entry.isIntersecting;
        setIsOnHero((prevIsOnHero) =>
          prevIsOnHero === nextIsOnHero ? prevIsOnHero : nextIsOnHero,
        );
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-80px 0px 0px 0px',
      },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHomePage]);

  return (
    <>
      <HeaderDesktop showAdmin={showAdmin} forceDark={isOnHero} />
      <HeaderMobile showAdmin={showAdmin} />
    </>
  );
}

/** Mobile header with a burger menu and a slide-out drawer navigation. */
function HeaderMobile({showAdmin}: {showAdmin?: boolean}) {
  const [opened, {toggle, close}] = useDisclosure(false);
  return (
    <>
      <Flex
        className={classes.mobileWrapper}
        justify="space-between"
        gap="xl"
        align="center"
        direction="row"
        wrap="nowrap"
        hiddenFrom={breakpoint}>
        <Burger size="sm" opened={opened} onClick={toggle} />
        <Logo width={120} height={30} />
        <ColorSchemeButton />
      </Flex>

      <Drawer
        opened={opened}
        onClose={close}
        title={<Logo width={120} height={30} />}
        padding="md"
        size="xs"
        hiddenFrom={breakpoint}>
        <Stack gap="sm">
          <AdminButton showAdmin={showAdmin} />
          {headerLinks.map((link) => {
            if ('items' in link) {
              return (
                <Stack key={link.label} gap={6}>
                  <Text fw={700}>{link.label}</Text>
                  <Stack gap="xs" pl="sm">
                    {link.items.map((item) => (
                      <Anchor
                        key={item.href}
                        component={NextLink}
                        href={item.href}
                        onClick={close}>
                        {item.label}
                      </Anchor>
                    ))}
                  </Stack>
                </Stack>
              );
            }
            return (
              <Anchor
                key={link.href}
                component={NextLink}
                href={link.href}
                onClick={close}>
                {link.label}
              </Anchor>
            );
          })}
        </Stack>
      </Drawer>
    </>
  );
}

/** Desktop header with animated navigation links and an optional admin CTA. */
function HeaderDesktop({
  showAdmin,
  forceDark,
}: {
  showAdmin?: boolean;
  forceDark?: boolean;
}) {
  return (
    <Flex
      className={
        forceDark
          ? `${classes.desktopWrapper} ${classes.onHero}`
          : classes.desktopWrapper
      }
      visibleFrom={breakpoint}
      justify="center"
      mt="md">
      <Container
        className={classes.container}
        data-on-hero={forceDark ? 'true' : 'false'}
        component="header"
        style={{borderRadius: 30}}
        w={{base: '100%', [breakpoint]: 'fit-content'}}
        h={60}>
        <Flex
          justify="space-between"
          align="center"
          h="100%"
          style={{overflow: 'hidden'}}
          gap="xs"
          wrap="nowrap">
          <Logo width={120} height={30} forceLight={!!forceDark} />

          <motion.div
            initial={{width: 0, opacity: 0}}
            whileInView={{width: 'fit-content', opacity: 1}}
            transition={{duration: 0.8, ease: 'easeInOut'}}
            viewport={{once: true}}>
            <Flex
              flex={1}
              justify="center"
              px="lg"
              h="100%"
              align="center"
              wrap="nowrap"
              gap="lg"
              className={classes['link-container']}>
              {headerLinks.map((link) => {
                if ('items' in link) {
                  return (
                    <Menu
                      key={link.label}
                      withinPortal
                      trigger="hover"
                      openDelay={60}
                      closeDelay={180}
                      position="bottom-start"
                      offset={8}>
                      <Menu.Target>
                        <UnstyledButton
                          className={
                            forceDark
                              ? `${classes.link} ${classes.linkOnHero}`
                              : classes.link
                          }
                          type="button">
                          {link.label}
                        </UnstyledButton>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {link.items.map((item) => (
                          <Menu.Item
                            key={item.href}
                            component={NextLink}
                            href={item.href}>
                            {item.label}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  );
                }
                return (
                  <Anchor
                    key={link.href}
                    className={
                      forceDark
                        ? `${classes.link} ${classes.linkOnHero}`
                        : classes.link
                    }
                    component={NextLink}
                    href={link.href}
                    td="none">
                    {link.label}
                  </Anchor>
                );
              })}
            </Flex>
          </motion.div>

          <AdminButton showAdmin={showAdmin} />
        </Flex>
      </Container>

      <div className={classes.colorSchemeButton}>
        <ColorSchemeButton />
      </div>
    </Flex>
  );
}

/** Conditionally renders the admin CTA button linking to the admin dashboard. */
function AdminButton({showAdmin}: {showAdmin?: boolean}) {
  if (!showAdmin) return null;
  return (
    <Button
      component={NextLink}
      href="/admin"
      className={classes.cta}
      radius="xl"
      rightSection={<IconArrowRight size={16} />}>
      Admin
    </Button>
  );
}
