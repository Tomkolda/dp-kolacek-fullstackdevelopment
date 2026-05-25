'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Image,
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
import type {AdminGallery} from '@/lib/server/getGalleriesAdmin';
import {toggleArchive} from '@/lib/server/toggleArchive';
import {compareDates, formatDate} from '@/lib/utils/datetime';

import {CreateGalleryModal} from './CreateGalleryModal';
import {EditGalleryModal} from './EditGalleryModal';

type GalleriesTableProps = {
  galleries: AdminGallery[];
};

export function GalleriesTable({galleries}: GalleriesTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [modalOpened, {open: openModal, close: closeModal}] =
    useDisclosure(false);
  const [editGallery, setEditGallery] = useState<AdminGallery | null>(null);
  const [editOpened, {open: openEdit, close: closeEdit}] = useDisclosure(false);

  const onEdit = useCallback(
    (gallery: AdminGallery) => {
      setEditGallery(gallery);
      openEdit();
    },
    [openEdit],
  );

  const onToggleArchive = useCallback(
    (gallery: AdminGallery) => {
      const archive = !gallery.archivedAt;
      setPendingId(gallery.id);
      void (async () => {
        try {
          const result = await toggleArchive('galleries', gallery.id, archive);
          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message:
              result.error ?? 'Archivaci galerie se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci galerie se nepodařilo dokončit.',
            color: 'red',
          });
        } finally {
          setPendingId(null);
        }
      })();
    },
    [router],
  );

  const columns: Array<ColumnDef<AdminGallery>> = useMemo(
    () => [
      {
        key: 'cover',
        header: 'Cover',
        render: (gallery) =>
          gallery.coverImageUrl ? (
            <Image
              src={gallery.coverImageUrl}
              alt={gallery.title}
              w={48}
              h={48}
              radius="sm"
              fit="cover"
            />
          ) : (
            <Box
              w={48}
              h={48}
              bg="gray.2"
              style={{borderRadius: 'var(--mantine-radius-sm)'}}
            />
          ),
      },
      {
        key: 'title',
        header: 'Název',
        render: (gallery) => (
          <Text fw={500} lineClamp={1}>
            {gallery.title}
          </Text>
        ),
        sortable: true,
        sortFn: (a, b) => a.title.localeCompare(b.title, 'cs'),
        searchValue: (gallery) => gallery.title,
      },
      {
        key: 'slug',
        header: 'Slug',
        render: (gallery) => (
          <Text size="sm" c="dimmed" lineClamp={1}>
            {gallery.slug}
          </Text>
        ),
        searchValue: (gallery) => gallery.slug,
      },
      {
        key: 'date',
        header: 'Datum',
        render: (gallery) => (
          <Text size="sm" style={{whiteSpace: 'nowrap'}}>
            {formatDate(gallery.date, 'd. M. yyyy') ?? '—'}
          </Text>
        ),
        sortable: true,
        sortFn: (a, b) => compareDates(a.date, b.date),
      },
      {
        key: 'photoCount',
        header: 'Fotek',
        render: (gallery) => (
          <Badge
            variant="light"
            color={gallery.photoCount > 0 ? 'blue' : 'gray'}>
            {gallery.photoCount}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Akce',
        render: (gallery) => (
          <Group gap="xs" wrap="nowrap">
            <Tooltip label="Upravit">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                aria-label="Upravit"
                disabled={pendingId !== null}
                onClick={() => onEdit(gallery)}>
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={gallery.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
              <ActionIcon
                variant="subtle"
                color={gallery.archivedAt ? 'green' : 'red'}
                size="sm"
                aria-label={gallery.archivedAt ? 'Odarchivovat' : 'Archivovat'}
                loading={pendingId === gallery.id}
                disabled={pendingId !== null && pendingId !== gallery.id}
                onClick={() => onToggleArchive(gallery)}>
                {gallery.archivedAt ? (
                  <IconArchiveOff size={16} />
                ) : (
                  <IconArchive size={16} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [onEdit, onToggleArchive, pendingId],
  );

  return (
    <Box>
      <Group justify="flex-end" mb="md">
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openModal}>
          Přidat galerii
        </Button>
      </Group>

      <CreateGalleryModal opened={modalOpened} onCloseAction={closeModal} />
      <EditGalleryModal
        opened={editOpened}
        gallery={editGallery}
        onCloseAction={closeEdit}
      />

      <AdminTable
        data={galleries}
        columns={columns}
        searchPlaceholder="Hledat podle názvu, slugu..."
        getRowKey={(gallery) => gallery.id}
        noun={{genitivePlural: 'galerií'}}
        defaultSort={{columnKey: 'date', direction: 'desc'}}
        emptyMessage="Žádné fotogalerie."
        noSearchResultsMessage="Žádné galerie neodpovídají vyhledávání."
      />
    </Box>
  );
}
