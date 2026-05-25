'use client';

import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Group,
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
import {BEACON_TYPES, type BeaconType} from '@/db/types';
import type {AdminBeacon} from '@/lib/server/getBeaconsAdmin';
import {toggleArchive} from '@/lib/server/toggleArchive';
import {formatDate} from '@/lib/utils/datetime';

import {CreateBeaconModal} from './CreateBeaconModal';
import {EditBeaconModal} from './EditBeaconModal';

const BEACON_TYPE_LABELS: Record<string, string> = {
  single: 'Single',
  album: 'Album',
  musicvideo: 'Videoklip',
};

const BEACON_TYPE_COLORS: Record<string, string> = {
  single: 'blue',
  album: 'violet',
  musicvideo: 'orange',
};

const columns: Array<ColumnDef<AdminBeacon>> = [
  {
    key: 'title',
    header: 'Název',
    render: (beacon) => (
      <Text fw={500} lineClamp={1}>
        {beacon.title}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => a.title.localeCompare(b.title, 'cs'),
    searchValue: (beacon) => beacon.title,
  },
  {
    key: 'type',
    header: 'Typ',
    render: (beacon) => (
      <Badge
        variant="light"
        color={BEACON_TYPE_COLORS[beacon.type] ?? 'gray'}
        size="sm">
        {BEACON_TYPE_LABELS[beacon.type] ?? beacon.type}
      </Badge>
    ),
    searchValue: (beacon) => BEACON_TYPE_LABELS[beacon.type] ?? beacon.type,
  },
  {
    key: 'slug',
    header: 'Slug',
    render: (beacon) => (
      <Text ff="monospace" size="sm">
        {beacon.slug}
      </Text>
    ),
    searchValue: (beacon) => beacon.slug,
  },
  {
    key: 'releaseDate',
    header: 'Datum vydání',
    render: (beacon) => (
      <Text size="sm" style={{whiteSpace: 'nowrap'}}>
        {formatDate(beacon.releaseDate, 'd. M. yyyy') ?? '—'}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => a.releaseDate.localeCompare(b.releaseDate),
  },
  {
    key: 'beaconLink',
    header: 'Odkaz',
    render: (beacon) => (
      <Anchor
        href={`/r/${beacon.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        size="sm">
        /r/{beacon.slug}
      </Anchor>
    ),
  },
];

function makeActionsColumn(
  onEdit: (beacon: AdminBeacon) => void,
  onToggleArchive: (beacon: AdminBeacon) => void,
  pendingId: number | null,
): ColumnDef<AdminBeacon> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (beacon) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(beacon)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={beacon.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={beacon.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={beacon.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === beacon.id}
            disabled={pendingId !== null && pendingId !== beacon.id}
            onClick={() => onToggleArchive(beacon)}>
            {beacon.archivedAt ? (
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

type BeaconsTableProps = {
  beacons: AdminBeacon[];
};

const sharedTableProps = {
  searchPlaceholder: 'Hledat podle názvu, typu nebo slugu...',
  getRowKey: (beacon: AdminBeacon) => beacon.id,
  noun: {genitivePlural: 'beaconů'} as const,
  noSearchResultsMessage: 'Žádné beacony neodpovídají vyhledávání.',
};

export function BeaconsTable({beacons}: BeaconsTableProps) {
  const router = useRouter();
  const [createOpened, {open: openCreateModal, close: closeCreateModal}] =
    useDisclosure(false);
  const [editOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [editingBeacon, setEditingBeacon] = useState<AdminBeacon | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<BeaconType | null>(null);

  const onEdit = useCallback(
    (beacon: AdminBeacon) => {
      setEditingBeacon(beacon);
      openEditModal();
    },
    [openEditModal],
  );

  const onCloseEditModal = useCallback(() => {
    closeEditModal();
    setEditingBeacon(null);
  }, [closeEditModal]);

  const onToggleArchive = useCallback(
    (beacon: AdminBeacon) => {
      const archive = !beacon.archivedAt;
      setPendingId(beacon.id);
      void (async () => {
        try {
          const result = await toggleArchive('beacons', beacon.id, archive);

          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message:
              result.error ?? 'Archivaci beaconu se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci beaconu se nepodařilo dokončit.',
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

  const filteredBeacons = useMemo(
    () => (activeType ? beacons.filter((b) => b.type === activeType) : beacons),
    [beacons, activeType],
  );

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Title order={2}>Beacons</Title>
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}>
          Přidat beacon
        </Button>
      </Group>

      <Group gap="xs" mb="md">
        {BEACON_TYPES.map((type) => (
          <Badge
            key={type}
            size="lg"
            variant={activeType === type ? 'filled' : 'light'}
            color={activeType === type ? 'blue' : 'gray'}
            style={{cursor: 'pointer'}}
            onClick={() =>
              setActiveType((prev) => (prev === type ? null : type))
            }>
            {BEACON_TYPE_LABELS[type]}
          </Badge>
        ))}
      </Group>

      <AdminTable
        {...sharedTableProps}
        data={filteredBeacons}
        columns={allColumns}
        emptyMessage="Žádné beacony."
      />

      <CreateBeaconModal
        opened={createOpened}
        onCloseAction={closeCreateModal}
      />
      <EditBeaconModal
        opened={editOpened}
        beacon={editingBeacon}
        onCloseAction={onCloseEditModal}
      />
    </Box>
  );
}
