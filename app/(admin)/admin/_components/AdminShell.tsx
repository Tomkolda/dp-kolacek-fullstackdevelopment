'use client';

import {AppShell, Burger} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';

import {Navbar} from './Navbar';

export function AdminShell({children}: {children: React.ReactNode}) {
  const [opened, {toggle, close}] = useDisclosure(false);

  return (
    <AppShell
      padding="md"
      header={{height: 0}}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {mobile: !opened},
      }}>
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      </AppShell.Header>

      <AppShell.Navbar style={{display: 'flex'}}>
        <Navbar onLinkClick={close} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
