'use client';

import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Image,
  NumberInput,
  Stack,
  Text,
} from '@mantine/core';
import {IconSend, IconTrash} from '@tabler/icons-react';
import Link from 'next/link';

import classes from './CartDrawer.module.css';
import {useCart} from './CartProvider';

type CartDrawerProps = {
  opened: boolean;
  onClose: () => void;
};

function formatPrice(priceCzk: number): string {
  return `${priceCzk.toLocaleString('cs-CZ')} Kč`;
}

export function CartDrawer({opened, onClose}: CartDrawerProps) {
  const {items, removeItem, updateQuantity, clearCart, totalPrice} = useCart();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Košík"
      position="right"
      size="sm"
      padding="md">
      {items.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          Košík je prázdný
        </Text>
      ) : (
        <Stack gap="md" justify="space-between" h="100%">
          <Stack gap="sm" style={{flex: 1, overflow: 'auto'}}>
            {items.map((item) => (
              <Box
                key={`${item.productId}-${item.variantIndex}`}
                className={classes.itemRow}>
                {item.coverImageUrl && (
                  <Image
                    src={item.coverImageUrl}
                    alt={item.productTitle}
                    w={56}
                    h={56}
                    fit="contain"
                    className={classes.itemImage}
                    fallbackSrc="https://placehold.co/56x56?text=?"
                  />
                )}

                <Box className={classes.itemInfo}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    {item.productTitle}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.variantLabel}
                  </Text>
                  <Group gap="xs" mt={4} align="center">
                    <NumberInput
                      value={item.quantity}
                      onChange={(val) =>
                        updateQuantity(
                          item.productId,
                          item.variantIndex,
                          typeof val === 'number' ? val : 1,
                        )
                      }
                      min={1}
                      max={99}
                      size="xs"
                      w={64}
                      clampBehavior="strict"
                    />
                    <Text size="sm" fw={500} className={classes.itemPrice}>
                      {formatPrice(item.priceCzk * item.quantity)}
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() =>
                        removeItem(item.productId, item.variantIndex)
                      }
                      aria-label={`Odebrat ${item.productTitle}`}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Box>
              </Box>
            ))}
          </Stack>

          <Box className={classes.footer}>
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Celkem</Text>
              <Text fw={700} size="lg" className={classes.itemPrice}>
                {formatPrice(totalPrice)}
              </Text>
            </Group>
            <Button
              component={Link}
              href="/merch/objednavka"
              fullWidth
              size="md"
              leftSection={<IconSend size={18} />}
              onClick={onClose}
              mb="xs">
              Odeslat objednávku
            </Button>
            <Button
              variant="subtle"
              color="red"
              fullWidth
              size="xs"
              onClick={clearCart}>
              Vyprázdnit košík
            </Button>
          </Box>
        </Stack>
      )}
    </Drawer>
  );
}
