import {Anchor, Box, Center} from '@mantine/core';
import {IconArrowLeft} from '@tabler/icons-react';
import Link from 'next/link';

import classes from './AuthLoginLink.module.css';

export function AuthLoginLink() {
  return (
    <Anchor
      component={Link}
      href="/auth/login"
      c="dimmed"
      size="sm"
      className={classes.control}>
      <Center inline>
        <IconArrowLeft size={12} stroke={1.5} />
        <Box ml={5}>Zpět na stránku přihlášení</Box>
      </Center>
    </Anchor>
  );
}
