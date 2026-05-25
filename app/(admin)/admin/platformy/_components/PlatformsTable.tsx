'use client';

import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Text,
  Title,
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
import type {DBPlatform} from '@/db/types';
import {toggleArchive} from '@/lib/server/toggleArchive';
import {getImageUrl} from '@/lib/utils/getImageUrl';

import {CreatePlatformModal} from './CreatePlatformModal';
import {EditPlatformModal} from './EditPlatformModal';

const columns: Array<ColumnDef<DBPlatform>> = [
  {
    key: 'name',
    header: 'Název',
    render: (platform) => (
      <Text fw={500} lineClamp={1}>
        {platform.name}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => a.name.localeCompare(b.name, 'cs'),
    searchValue: (platform) => platform.name,
  },
  {
    key: 'logo',
    header: 'Logo',
    render: (platform) => (
      <Image
        src={getImageUrl('platforms', platform.image)}
        alt={platform.name}
        w={64}
        h={32}
        fit="contain"
        fallbackSrc="https://placehold.co/64x32?text=Logo"
      />
    ),
  },
  {
    key: 'link',
    header: 'Odkaz',
    render: (platform) => (
      <Text size="sm" ff="monospace" lineClamp={1}>
        {platform.link}
      </Text>
    ),
    searchValue: (platform) => platform.link,
  },
  {
    key: 'logoSettings',
    header: 'Parametry loga',
    render: (platform) => (
      <Text size="sm">
        Scale: {platform.logoScale ?? '—'} | Y: {platform.logoTranslateY ?? '—'}
      </Text>
    ),
  },
];

function makeActionsColumn(
  onEdit: (platform: DBPlatform) => void,
  onToggleArchive: (platform: DBPlatform) => void,
  pendingId: number | null,
): ColumnDef<DBPlatform> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (platform) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(platform)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={platform.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={platform.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={platform.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === platform.id}
            disabled={pendingId !== null && pendingId !== platform.id}
            onClick={() => onToggleArchive(platform)}>
            {platform.archivedAt ? (
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

type PlatformsTableProps = {
  platforms: DBPlatform[];
};

const sharedTableProps = {
  searchPlaceholder: 'Hledat podle názvu nebo odkazu...',
  getRowKey: (platform: DBPlatform) => platform.id,
  noun: {genitivePlural: 'platforem'} as const,
  emptyMessage: 'Žádné platformy.',
  noSearchResultsMessage: 'Žádné platformy neodpovídají vyhledávání.',
};

export function PlatformsTable({platforms}: PlatformsTableProps) {
  const router = useRouter();
  const [createModalOpened, {open: openCreateModal, close: closeCreateModal}] =
    useDisclosure(false);
  const [editModalOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [editingPlatform, setEditingPlatform] = useState<DBPlatform | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<number | null>(null);

  const onEdit = useCallback(
    (platform: DBPlatform) => {
      setEditingPlatform(platform);
      openEditModal();
    },
    [openEditModal],
  );

  const onCloseEditModal = useCallback(() => {
    closeEditModal();
    setEditingPlatform(null);
  }, [closeEditModal]);

  const onToggleArchive = useCallback(
    (platform: DBPlatform) => {
      const archive = !platform.archivedAt;
      setPendingId(platform.id);

      void (async () => {
        try {
          const result = await toggleArchive('platforms', platform.id, archive);
          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message:
              result.error ?? 'Archivaci platformy se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci platformy se nepodařilo dokončit.',
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
        <Title order={2}>Platformy</Title>
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}>
          Přidat platformu
        </Button>
      </Group>

      <CreatePlatformModal
        opened={createModalOpened}
        onCloseAction={closeCreateModal}
      />
      <EditPlatformModal
        opened={editModalOpened}
        platform={editingPlatform}
        onCloseAction={onCloseEditModal}
      />

      <AdminTable
        {...sharedTableProps}
        data={platforms}
        columns={allColumns}
        defaultSort={{columnKey: 'name', direction: 'asc'}}
      />
    </Box>
  );
}
