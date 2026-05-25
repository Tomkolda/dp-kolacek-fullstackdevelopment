'use client';

import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Group,
  SegmentedControl,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconArchive,
  IconArchiveOff,
  IconBrandFacebook,
  IconEdit,
  IconMapPin,
  IconPlus,
} from '@tabler/icons-react';
import {useRouter} from 'next/navigation';
import {useCallback, useId, useMemo, useState} from 'react';

import adminModalClasses from '@/components/shared/AdminModal/Modal.module.css';
import {AdminTable, type ColumnDef} from '@/components/shared/AdminTable';
import type {DBGig} from '@/db/types';
import {toggleArchive} from '@/lib/server/toggleArchive';
import {
  compareDates,
  formatDate,
  formatTime,
  isPastDate,
} from '@/lib/utils/datetime';
import {isHttpUrl} from '@/lib/utils/url';
import {formatPrice} from '@/lib/utils/utilsClient';

import {CreateGigModal} from './CreateGigModal';
import {EditGigModal} from './EditGigModal';

function getSafeHttpLink(link: string | null): string | null {
  return link && isHttpUrl(link) ? link : null;
}

const columns: Array<ColumnDef<DBGig>> = [
  {
    key: 'date',
    header: 'Datum',
    render: (gig) => (
      <Text size="sm" style={{whiteSpace: 'nowrap'}}>
        {formatDate(gig.date, 'd. M. yyyy') ?? '—'}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => compareDates(a.date, b.date),
  },
  {
    key: 'city',
    header: 'Město',
    render: (gig) => (
      <Text size="sm" lineClamp={1}>
        {gig.city || '—'}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => (a.city ?? '').localeCompare(b.city ?? '', 'cs'),
    searchValue: (gig) => gig.city ?? '',
  },
  {
    key: 'location',
    header: 'Místo',
    render: (gig) => (
      <Text size="sm" lineClamp={1}>
        {gig.location || '—'}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => (a.location ?? '').localeCompare(b.location ?? '', 'cs'),
    searchValue: (gig) => gig.location ?? '',
  },
  {
    key: 'title',
    header: 'Název',
    render: (gig) => (
      <Text fw={500} lineClamp={1}>
        {gig.title}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => a.title.localeCompare(b.title, 'cs'),
    searchValue: (gig) => gig.title,
  },
  {
    key: 'time',
    header: 'Čas',
    render: (gig) => (
      <Text size="sm" style={{whiteSpace: 'nowrap'}}>
        {formatTime(gig.startTime) ?? '—'}
        {gig.endTime ? ` – ${formatTime(gig.endTime)}` : ''}
      </Text>
    ),
  },
  {
    key: 'price',
    header: 'Vstupné',
    render: (gig) => (
      <Text size="sm" style={{whiteSpace: 'nowrap'}}>
        {formatPrice(gig.price)}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => (a.price ?? 0) - (b.price ?? 0),
  },
  {
    key: 'links',
    header: 'Odkazy',
    render: (gig) => {
      const facebookLink = getSafeHttpLink(gig.facebookLink);
      const mapLink = getSafeHttpLink(gig.mapLink);

      return (
        <Group gap="xs">
          {facebookLink && (
            <Tooltip label="Facebook událost">
              <Anchor
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                c="blue"
                aria-label="Facebook událost">
                <IconBrandFacebook size={18} />
              </Anchor>
            </Tooltip>
          )}
          {mapLink && (
            <Tooltip label="Zobrazit na mapě">
              <Anchor
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                c="red"
                aria-label="Zobrazit na mapě">
                <IconMapPin size={18} />
              </Anchor>
            </Tooltip>
          )}
          {!facebookLink && !mapLink && (
            <Text size="sm" c="dimmed">
              —
            </Text>
          )}
        </Group>
      );
    },
  },
];

function makeActionsColumn(
  onEdit: (gig: DBGig) => void,
  onToggleArchive: (gig: DBGig) => void,
  pendingId: number | null,
): ColumnDef<DBGig> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (gig) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(gig)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={gig.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={gig.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={gig.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === gig.id}
            disabled={pendingId !== null && pendingId !== gig.id}
            onClick={() => onToggleArchive(gig)}>
            {gig.archivedAt ? (
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

type GigsTableProps = {
  gigs: DBGig[];
};

const sharedTableProps = {
  searchPlaceholder: 'Hledat podle místa, názvu...',
  getRowKey: (gig: DBGig) => gig.id,
  noun: {genitivePlural: 'koncertů'} as const,
  noSearchResultsMessage: 'Žádné koncerty neodpovídají vyhledávání.',
};

export function GigsTable({gigs}: GigsTableProps) {
  const id = useId();
  const router = useRouter();
  const [tab, setTab] = useState('upcoming');
  const [modalOpened, {open: openModal, close: closeModal}] =
    useDisclosure(false);
  const [editModalOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [editingGig, setEditingGig] = useState<DBGig | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const onEdit = useCallback(
    (gig: DBGig) => {
      setEditingGig(gig);
      openEditModal();
    },
    [openEditModal],
  );

  const onCloseEditModal = useCallback(() => {
    closeEditModal();
    setEditingGig(null);
  }, [closeEditModal]);

  const onToggleArchive = useCallback(
    (gig: DBGig) => {
      const archive = !gig.archivedAt;
      setPendingId(gig.id);
      void (async () => {
        try {
          const result = await toggleArchive('gigs', gig.id, archive);
          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message:
              result.error ?? 'Archivaci koncertu se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci koncertu se nepodařilo dokončit.',
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

  // Note: isPastDate compares against startOf('day'), so today's gigs always
  // appear in "Nadcházející" even if they already occurred earlier in the day.
  // This is intentional – the admin view groups gigs by day, not by exact time.
  const upcomingGigs = useMemo(
    () => gigs.filter((g) => !isPastDate(g.date)),
    [gigs],
  );

  const pastGigs = useMemo(
    () => gigs.filter((g) => isPastDate(g.date)),
    [gigs],
  );

  const isUpcoming = tab === 'upcoming';
  const currentData = isUpcoming ? upcomingGigs : pastGigs;

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Title order={2}>Koncerty</Title>
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openModal}>
          Přidat koncert
        </Button>
      </Group>

      <CreateGigModal opened={modalOpened} onCloseAction={closeModal} />
      <EditGigModal
        opened={editModalOpened}
        gig={editingGig}
        onCloseAction={onCloseEditModal}
      />

      <SegmentedControl
        id={`${id}-tab`}
        value={tab}
        onChange={setTab}
        mb="md"
        data={[
          {
            label: `Nadcházející (${upcomingGigs.length})`,
            value: 'upcoming',
          },
          {
            label: `Proběhlé (${pastGigs.length})`,
            value: 'past',
          },
        ]}
      />

      <AdminTable
        {...sharedTableProps}
        key={tab}
        data={currentData}
        columns={allColumns}
        defaultSort={{
          columnKey: 'date',
          direction: isUpcoming ? 'asc' : 'desc',
        }}
        emptyMessage={
          isUpcoming
            ? 'Žádné nadcházející koncerty.'
            : 'Žádné proběhlé koncerty.'
        }
      />
    </Box>
  );
}
