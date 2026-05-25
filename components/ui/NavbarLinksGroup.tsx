'use client';

import {
  Box,
  Collapse,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {IconChevronRight} from '@tabler/icons-react';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

import classes from './NavbarLinksGroup.module.css';

interface LinksGroupProps {
  icon: React.ComponentType<{size?: number | string}>;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  links?: Array<{label: string; link: string}>;
  color?: string;
  onLinkClick?: () => void;
}

export function LinksGroup({
  icon: Icon,
  color,
  label,
  initiallyOpened,
  link,
  links,
  onLinkClick,
}: LinksGroupProps) {
  const router = useRouter();
  const hasLinks = Array.isArray(links) && links.length > 0;
  const [opened, setOpened] = useState(initiallyOpened || false);
  const items = (hasLinks ? links : []).map((link) => (
    <Text<'a'>
      component="a"
      className={classes.link}
      href={link.link}
      key={link.label}
      onClick={(event) => {
        event.preventDefault();
        router.push(link.link);
        onLinkClick?.();
      }}>
      {link.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton
        onClick={() => {
          if (hasLinks) {
            setOpened((o) => !o);
          } else if (link) {
            router.push(link);
            onLinkClick?.();
          } else {
            onLinkClick?.();
          }
        }}
        className={classes.control}>
        <Group justify="space-between" gap={0}>
          <Box style={{display: 'flex', alignItems: 'center'}}>
            <ThemeIcon variant="light" size={30} color={color}>
              <Icon size={18} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              size={16}
              style={{transform: opened ? 'rotate(-90deg)' : 'none'}}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
