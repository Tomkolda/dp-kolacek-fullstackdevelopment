'use client';

import {ActionIcon, Box, Button, Group, Text, Tooltip} from '@mantine/core';
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
import type {DBAlbum} from '@/db/types';
import {toggleArchive} from '@/lib/server/toggleArchive';
import {compareDates} from '@/lib/utils/datetime';

import {CreateAlbumModal} from './CreateAlbumModal';
import {EditAlbumModal} from './EditAlbumModal';

const columns: Array<ColumnDef<DBAlbum>> = [
  {
    key: 'title',
    header: 'Název',
    render: (album) => (
      <Text fw={500} lineClamp={1}>
        {album.title}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => a.title.localeCompare(b.title, 'cs'),
    searchValue: (album) => album.title,
  },
  {
    key: 'releaseDate',
    header: 'Vydání',
    render: (album) => (
      <Text size="sm" style={{whiteSpace: 'nowrap'}}>
        {album.releaseDate.slice(0, 4) || '—'}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => compareDates(a.releaseDate, b.releaseDate),
  },
  {
    key: 'label',
    header: 'Label',
    render: (album) => (
      <Text size="sm" c={album.label ? undefined : 'dimmed'} lineClamp={1}>
        {album.label ?? '—'}
      </Text>
    ),
    searchValue: (album) => album.label ?? '',
  },
  {
    key: 'recordedBy',
    header: 'Studio',
    render: (album) => (
      <Text size="sm" c={album.recordedBy ? undefined : 'dimmed'} lineClamp={1}>
        {album.recordedBy ?? '—'}
      </Text>
    ),
    searchValue: (album) => album.recordedBy ?? '',
  },
  {
    key: 'trackCount',
    header: 'Skladeb',
    render: (album) => <Text size="sm">{album.tracks?.length ?? 0}</Text>,
  },
];

function makeActionsColumn(
  onEdit: (album: DBAlbum) => void,
  onToggleArchive: (album: DBAlbum) => void,
  pendingId: number | null,
): ColumnDef<DBAlbum> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (album) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(album)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={album.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={album.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={album.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === album.id}
            disabled={pendingId !== null && pendingId !== album.id}
            onClick={() => onToggleArchive(album)}>
            {album.archivedAt ? (
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

type AlbumsTableProps = {
  albums: DBAlbum[];
};

const sharedTableProps = {
  searchPlaceholder: 'Hledat podle názvu, labelu nebo studia...',
  getRowKey: (album: DBAlbum) => album.id,
  noun: {genitivePlural: 'alb'} as const,
  emptyMessage: 'Žádná alba v databázi.',
  noSearchResultsMessage: 'Žádná alba neodpovídají vyhledávání.',
};

export function AlbumsTable({albums}: AlbumsTableProps) {
  const router = useRouter();
  const [createModalOpened, {open: openCreateModal, close: closeCreateModal}] =
    useDisclosure(false);
  const [editModalOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<DBAlbum | null>(null);

  const onEdit = useCallback(
    (album: DBAlbum) => {
      setEditingAlbum(album);
      openEditModal();
    },
    [openEditModal],
  );

  const handleCloseEditModal = useCallback(() => {
    closeEditModal();
    setEditingAlbum(null);
  }, [closeEditModal]);

  const onToggleArchive = useCallback(
    (album: DBAlbum) => {
      const archive = !album.archivedAt;
      setPendingId(album.id);

      void (async () => {
        try {
          const result = await toggleArchive('albums', album.id, archive);
          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message: result.error ?? 'Archivaci alba se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci alba se nepodařilo dokončit.',
            color: 'red',
          });
        } finally {
          setPendingId(null);
        }
      })();
    },
    [router],
  );

  const actionsColumn = useMemo(
    () => makeActionsColumn(onEdit, onToggleArchive, pendingId),
    [onEdit, onToggleArchive, pendingId],
  );

  const allColumns = useMemo(
    () => [...columns, actionsColumn],
    [actionsColumn],
  );

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Text component="h2" size="1.5rem" fw={700}>
          Diskografie
        </Text>
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}>
          Přidat album
        </Button>
      </Group>

      <CreateAlbumModal
        opened={createModalOpened}
        onCloseAction={closeCreateModal}
      />
      <EditAlbumModal
        opened={editModalOpened}
        album={editingAlbum}
        onCloseAction={handleCloseEditModal}
      />

      <AdminTable
        {...sharedTableProps}
        data={albums}
        columns={allColumns}
        defaultSort={{columnKey: 'title', direction: 'asc'}}
      />
    </Box>
  );
}
