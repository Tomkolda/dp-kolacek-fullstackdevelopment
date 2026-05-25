'use client';

import {ActionIcon, Avatar, Group, Text, Tooltip} from '@mantine/core';
import {IconLogout} from '@tabler/icons-react';
import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';

import {createClient} from '@/lib/supabase/client';

import classes from './UserButton.module.css';

function getInitials(input: string) {
  const cleaned = input.trim();
  if (!cleaned) return '?';

  const base = cleaned.includes('@')
    ? (cleaned.split('@')[0] ?? cleaned)
    : cleaned;
  const parts = base
    .split(/[\s._-]+/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const first = parts[0]?.[0] ?? '';
  const second =
    parts.length >= 2 ? (parts[1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
  const letters = `${first}${second}`;
  return letters.toUpperCase() || '?';
}

export function UserButton() {
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {data} = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      const meta = user.user_metadata ?? {};
      const nextFullName =
        (meta.full_name as string | undefined) ?? user.email ?? null;
      const nextEmail = user.email ?? null;

      setFullName(nextFullName);
      setEmail(nextEmail);
    }

    void load();
  }, []);

  const initials = useMemo(
    () => getInitials(fullName || email || 'Uživatel'),
    [email, fullName],
  );

  return (
    <div className={classes.user}>
      <Link
        href="/admin/user"
        className={classes.profileLink}
        aria-label="Otevřít profil uživatele">
        <span className={classes.srOnly}>Profil uživatele</span>
      </Link>
      <Group>
        <Avatar
          radius="xl"
          styles={{
            root: {
              backgroundColor: 'var(--mantine-color-myColor-7)',
              color: 'white',
              fontWeight: 700,
            },
          }}>
          {initials}
        </Avatar>

        <div style={{flex: 1}}>
          <Text size="sm" fw={500}>
            {fullName || 'Uživatel'}
          </Text>

          <Text c="dimmed" size="xs">
            {email || ''}
          </Text>
        </div>

        <form action="/auth/logout" method="post" className={classes.logout}>
          <ActionIcon
            component="button"
            type="submit"
            variant="subtle"
            aria-label="Odhlásit se">
            <Tooltip label="Odhlásit se">
              <IconLogout size={18} stroke={2} />
            </Tooltip>
          </ActionIcon>
        </form>
      </Group>
    </div>
  );
}
