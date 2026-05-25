import {Container, Stack} from '@mantine/core';

import {getMerchProductsAdmin} from '@/lib/server/getMerchProductsAdmin';

import {MerchProductsTable} from './_components/MerchProductsTable';

export default async function MerchProduktyPage() {
  const products = await getMerchProductsAdmin();

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <MerchProductsTable products={products} />
      </Container>
    </Stack>
  );
}
