import {
  Container,
  Grid,
  GridCol,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import type {MerchCategory} from '@/db/types';
import {
  getMerchProducts,
  type MerchProductListItem,
} from '@/lib/server/getMerchProducts';

import classes from './AllMerchProducts.module.css';
import {MerchProductCard} from './MerchProductCard';

type MerchSection = {
  key: string;
  label: string;
  description?: string;
  categories: MerchCategory[];
};

const MERCH_SECTIONS: MerchSection[] = [
  {
    key: 'cd',
    label: 'CD',
    description:
      'Dostupné jako lisované CD, nebo v digitální podobě (MP3, FLAC, WAV 16-bit/44,1kHz + booklet v PDF) skrze odkaz ke stažení.',
    categories: ['music_release'],
  },
  {
    key: 'apparel',
    label: 'Trička',
    description: 'Různé střihy, různé velikosti... vybírej!',
    categories: ['tshirt', 'hoodie'],
  },
  {
    key: 'accessories',
    label: 'Ostatní',
    description: 'Specialitky s omezeným počtem kusů.',
    categories: ['accessory'],
  },
];

export async function AllMerchProducts() {
  const allProducts = await getMerchProducts();

  const productsBySection = MERCH_SECTIONS.map((section) => ({
    ...section,
    products: allProducts.filter((p) =>
      section.categories.includes(p.category),
    ),
  }));

  const hasAnyProducts = allProducts.length > 0;

  return (
    <section id="merch">
      <Container py="xl" size="xl" className={classes.pageShell}>
        <Stack align="center" gap="sm" mb="xl">
          <Title order={1} ta="center" className={classes.heading}>
            Merchandise
          </Title>
        </Stack>

        {!hasAnyProducts ? (
          <Paper withBorder radius="xl" p="xl" className={classes.emptyState}>
            <Text c="dimmed" ta="center">
              Zatím zde nejsou žádné produkty.
            </Text>
          </Paper>
        ) : (
          <Stack gap={48}>
            {productsBySection.map((section) => (
              <MerchSectionGrid
                key={section.key}
                label={section.label}
                description={section.description}
                products={section.products}
              />
            ))}
          </Stack>
        )}
      </Container>
    </section>
  );
}

function MerchSectionGrid({
  label,
  description,
  products,
}: {
  label: string;
  description?: string;
  products: MerchProductListItem[];
}) {
  if (products.length === 0) return null;

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Title order={2} className={classes.sectionHeading}>
          {label}
        </Title>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </Stack>

      <Grid gutter="md">
        {products.map((product) => (
          <GridCol key={product.id} span={{base: 12, xs: 6, md: 4}}>
            <MerchProductCard product={product} />
          </GridCol>
        ))}
      </Grid>
    </Stack>
  );
}
