'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Text,
  Tooltip,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconArchive,
  IconArchiveOff,
  IconEdit,
  IconPlus,
} from '@tabler/icons-react';
import {useRouter} from 'next/navigation';
import {useCallback, useMemo, useState} from 'react';

import adminModalClasses from '@/components/shared/AdminModal/Modal.module.css';
import {AdminTable, type ColumnDef} from '@/components/shared/AdminTable';
import {
  type AccessoryMerchVariant,
  type DBMerchProduct,
  type HoodieMerchVariant,
  MERCH_CATEGORIES,
  type MerchCategory,
  type MusicReleaseMerchVariant,
  type TshirtMerchVariant,
} from '@/db/types';
import {toggleArchive} from '@/lib/server/toggleArchive';
import {
  MERCH_AVAILABILITY_COLORS,
  MERCH_AVAILABILITY_LABELS,
  MERCH_CATEGORY_LABELS,
} from '@/lib/utils/merch';

import {CreateMerchProductModal} from './CreateMerchProductModal';
import {EditMerchProductModal} from './EditMerchProductModal';

type MerchProductsTableProps = {
  products: DBMerchProduct[];
};

function getVariantLabel(
  variant:
    | MusicReleaseMerchVariant
    | TshirtMerchVariant
    | HoodieMerchVariant
    | AccessoryMerchVariant,
  category: MerchCategory,
): string {
  switch (category) {
    case 'music_release': {
      const v = variant as MusicReleaseMerchVariant;
      return v.edition ? `${v.format} (${v.edition})` : v.format;
    }
    case 'tshirt':
    case 'hoodie': {
      const v = variant as TshirtMerchVariant | HoodieMerchVariant;
      return `${v.size} / ${v.color}`;
    }
    case 'accessory':
      return (variant as AccessoryMerchVariant).label;
  }
}

function formatPrice(czk: number): string {
  return `${czk}\u00A0Kč`;
}

const columns: Array<ColumnDef<DBMerchProduct>> = [
  {
    key: 'title',
    header: 'Název',
    render: (product) => <Text fw={500}>{product.title}</Text>,
    sortable: true,
    sortFn: (a, b) => a.title.localeCompare(b.title, 'cs'),
    searchValue: (product) => product.title,
  },
  {
    key: 'category',
    header: 'Kategorie',
    render: (product) => (
      <Text size="sm">
        {MERCH_CATEGORY_LABELS[product.category] ?? product.category}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) =>
      (MERCH_CATEGORY_LABELS[a.category] ?? a.category).localeCompare(
        MERCH_CATEGORY_LABELS[b.category] ?? b.category,
        'cs',
      ),
  },
  {
    key: 'variants',
    header: 'Varianty',
    render: (product) => {
      const variants = Array.isArray(product.variants) ? product.variants : [];
      if (variants.length === 0) {
        return (
          <Text size="sm" c="dimmed">
            —
          </Text>
        );
      }
      const category = product.category;
      return (
        <Group gap={4} wrap="wrap" maw={350}>
          {variants.map((v) => {
            const label = getVariantLabel(v, category);
            return (
              <Tooltip
                key={label}
                label={`${formatPrice(v.priceCzk)} · ${MERCH_AVAILABILITY_LABELS[v.availability] ?? v.availability}`}>
                <Badge
                  size="sm"
                  variant="dot"
                  color={MERCH_AVAILABILITY_COLORS[v.availability] ?? 'gray'}>
                  {label}
                </Badge>
              </Tooltip>
            );
          })}
        </Group>
      );
    },
  },
  {
    key: 'description',
    header: 'Popis',
    render: (product) => (
      <Text size="sm" c="dimmed" lineClamp={1} maw={300}>
        {product.description ?? '—'}
      </Text>
    ),
    searchValue: (product) => `${product.title} ${product.description ?? ''}`,
  },
];

function makeActionsColumn(
  onEdit: (product: DBMerchProduct) => void,
  onToggleArchive: (product: DBMerchProduct) => void,
  pendingId: number | null,
): ColumnDef<DBMerchProduct> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (product) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(product)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={product.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={product.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={product.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === product.id}
            disabled={pendingId !== null && pendingId !== product.id}
            onClick={() => onToggleArchive(product)}>
            {product.archivedAt ? (
              <IconArchiveOff size={16} />
            ) : (
              <IconArchive size={16} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
  };
}

export function MerchProductsTable({products}: MerchProductsTableProps) {
  const router = useRouter();
  const [createModalOpened, {open: openCreateModal, close: closeCreateModal}] =
    useDisclosure(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<MerchCategory | null>(
    null,
  );
  const [editingProduct, setEditingProduct] = useState<DBMerchProduct | null>(
    null,
  );

  const onEdit = useCallback((product: DBMerchProduct) => {
    setEditingProduct(product);
  }, []);

  const onToggleArchive = useCallback(
    (product: DBMerchProduct) => {
      const archive = !product.archivedAt;
      setPendingId(product.id);

      void (async () => {
        try {
          const result = await toggleArchive(
            'merchProducts',
            product.id,
            archive,
          );

          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message:
              result.error ?? 'Archivaci produktu se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci produktu se nepodařilo dokončit.',
            color: 'red',
          });
        } finally {
          setPendingId(null);
        }
      })();
    },
    [router],
  );

  const allColumns = useMemo(
    () => [...columns, makeActionsColumn(onEdit, onToggleArchive, pendingId)],
    [onEdit, onToggleArchive, pendingId],
  );

  const filteredProducts = useMemo(
    () =>
      activeCategory
        ? products.filter((p) => p.category === activeCategory)
        : products,
    [products, activeCategory],
  );

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Text component="h2" size="1.5rem" fw={700}>
          Merch produkty
        </Text>
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}>
          Přidat produkt
        </Button>
      </Group>

      <CreateMerchProductModal
        opened={createModalOpened}
        onCloseAction={closeCreateModal}
      />

      <EditMerchProductModal
        opened={editingProduct !== null}
        product={editingProduct}
        onCloseAction={() => setEditingProduct(null)}
      />

      <Group gap="xs" mb="md">
        {MERCH_CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            size="lg"
            variant={activeCategory === cat ? 'filled' : 'light'}
            color={activeCategory === cat ? 'blue' : 'gray'}
            style={{cursor: 'pointer'}}
            onClick={() =>
              setActiveCategory((prev) => (prev === cat ? null : cat))
            }>
            {MERCH_CATEGORY_LABELS[cat]}
          </Badge>
        ))}
      </Group>

      <AdminTable
        data={filteredProducts}
        columns={allColumns}
        searchPlaceholder="Hledat podle názvu nebo popisu..."
        defaultSort={{columnKey: 'title', direction: 'asc'}}
        getRowKey={(product) => product.id}
        noun={{genitivePlural: 'produktů'}}
        emptyMessage="Žádné merch produkty v databázi."
        noSearchResultsMessage="Žádné produkty neodpovídají vyhledávání."
      />
    </Box>
  );
}
