'use client';

import {Group, ScrollArea} from '@mantine/core';
import {
  IconAlbum,
  IconArrowLeftRight,
  IconCalendarStats,
  IconCircleDottedLetterB,
  IconHome2,
  IconSettings,
  IconShoppingBag,
  IconWorld,
} from '@tabler/icons-react';

import {UserButton} from '@/app/(admin)/admin/_components/UserButton';
import {ColorSchemeButton} from '@/components/ui/ColorSchemeButton';
import {Logo} from '@/components/ui/Logo';
import {LinksGroup} from '@/components/ui/NavbarLinksGroup';

import classes from './Navbar.module.css';

const navbarLinks = [
  {label: 'Přehled', icon: IconHome2, link: '/admin'},
  {
    label: 'Koncerty',
    icon: IconCalendarStats,
    link: '/admin/koncerty',
  },
  {
    label: 'Merch',
    icon: IconShoppingBag,
    links: [
      {label: 'Produkty', link: '/admin/merch/produkty'},
      {label: 'Objednávky', link: '/admin/merch/objednavky'},
      {label: 'Nastavení prodeje', link: '/admin'},
      {label: 'Digitální prodej', link: '/admin'},
    ],
  },
  {
    label: 'Obsah webu',
    icon: IconAlbum,
    links: [
      {label: 'Diskografie', link: '/admin/diskografie'},
      {label: 'Sestava', link: '/admin/sestava'},
      {label: 'Videogalerie', link: '/admin'},
      {label: 'Fotogalerie', link: '/admin/fotogalerie'},
      {label: 'Sponzoři', link: '/admin/sponzori'},
      {label: 'Sociální sítě a profily', link: '/admin/profily'},
      {label: 'Streamovací platformy', link: '/admin/platformy'},
      {label: 'Kontakt', link: '/admin'},
      {label: 'Pro pořadatele', link: '/admin'},
    ],
  },
  {label: 'Beacons', icon: IconCircleDottedLetterB, link: '/admin/beacony'},
  {
    label: 'Link Redirector',
    icon: IconArrowLeftRight,
    link: '/admin/link-redirector',
  },
  {
    label: 'Nastavení webu',
    icon: IconSettings,
    link: '/admin/nastaveni-webu',
  },
  {
    label: 'Přepnout na veřejný web',
    icon: IconWorld,
    color: 'gray',
    link: '/',
  },
];

interface NavbarNestedProps {
  onLinkClick?: () => void;
}

export function Navbar({onLinkClick}: NavbarNestedProps) {
  const links = navbarLinks.map((item) => (
    <LinksGroup {...item} key={item.label} onLinkClick={onLinkClick} />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo width={120} height={30} />
          <ColorSchemeButton />
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}
