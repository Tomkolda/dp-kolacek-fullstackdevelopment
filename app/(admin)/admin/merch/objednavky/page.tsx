import {Container, Stack} from '@mantine/core';

import {getOrdersAdmin} from '@/lib/server/getOrdersAdmin';

import {OrdersTable} from './_components/OrdersTable';

export default async function MerchObjednavkyPage() {
  const orders = await getOrdersAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <OrdersTable orders={orders} />
      </Container>
    </Stack>
  );
}
