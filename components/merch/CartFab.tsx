'use client';

import {ActionIcon, Badge, Box} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {IconShoppingCart} from '@tabler/icons-react';

import {CartDrawer} from './CartDrawer';
import classes from './CartFab.module.css';
import {useCart} from './CartProvider';

export function CartFab() {
  const {totalItems} = useCart();
  const [opened, {open, close}] = useDisclosure(false);

  return (
    <>
      <Box className={classes.fab}>
        <ActionIcon
          variant="filled"
          size="xl"
          radius="xl"
          onClick={open}
          aria-label={`Košík (${totalItems})`}>
          <IconShoppingCart size={24} />
        </ActionIcon>
        {totalItems > 0 && (
          <Badge
            size="sm"
            circle
            color="red"
            variant="filled"
            className={classes.badge}>
            {totalItems}
          </Badge>
        )}
      </Box>

      <CartDrawer opened={opened} onClose={close} />
    </>
  );
}
