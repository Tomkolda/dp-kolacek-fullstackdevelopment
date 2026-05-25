'use client';

import {ActionIcon, Anchor, Button, Group, Text, Tooltip} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconArchive,
  IconArchiveOff,
  IconEdit,
  IconPlus,
} from '@tabler/icons-react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useCallback, useMemo, useState} from 'react';

import adminModalClasses from '@/components/shared/AdminModal/Modal.module.css';
import {AdminTable, type ColumnDef} from '@/components/shared/AdminTable';
import type {DBSponsor} from '@/db/types';
import {toggleArchive} from '@/lib/server/toggleArchive';
import {getImageUrl} from '@/lib/utils/getImageUrl';
import {isHttpUrl} from '@/lib/utils/url';

import {CreateSponsorModal} from './CreateSponsorModal';
import {EditSponsorModal} from './EditSponsorModal';

type SponsorsTableProps = {
  sponsors: DBSponsor[];
};

function formatLogoParams(sponsor: DBSponsor) {
  return `Scale: ${sponsor.logoScale ?? '—'} | Y: ${sponsor.logoTranslateY ?? '—'}`;
}

const columns: Array<ColumnDef<DBSponsor>> = [
  {
    key: 'name',
    header: 'Název',
    render: (sponsor) => <Text fw={500}>{sponsor.name}</Text>,
    sortable: true,
    sortFn: (a, b) => a.name.localeCompare(b.name, 'cs'),
    searchValue: (sponsor) => sponsor.name,
  },
  {
    key: 'logo',
    header: 'Logo',
    render: (sponsor) => (
      <Image
        src={getImageUrl('sponsors', sponsor.image)}
        alt={sponsor.name}
        width={140}
        height={48}
        unoptimized
        style={{
          width: 'auto',
          maxWidth: '140px',
          height: `${(sponsor.logoScale ?? 1) * 48}px`,
          transform: `translateY(${sponsor.logoTranslateY ?? 0}px)`,
          objectFit: 'contain',
        }}
      />
    ),
  },
  {
    key: 'link',
    header: 'Odkaz',
    render: (sponsor) => {
      if (!isHttpUrl(sponsor.link)) {
        return (
          <Text size="sm" c="dimmed">
            {sponsor.link}
          </Text>
        );
      }

      return (
        <Anchor
          href={sponsor.link}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          lineClamp={1}>
          {sponsor.link}
        </Anchor>
      );
    },
    sortable: true,
    sortFn: (a, b) => a.link.localeCompare(b.link, 'cs'),
    searchValue: (sponsor) => `${sponsor.name} ${sponsor.link}`,
  },
  {
    key: 'logoParams',
    header: 'Parametry loga',
    render: (sponsor) => (
      <Text size="sm" c="dimmed">
        {formatLogoParams(sponsor)}
      </Text>
    ),
  },
];

function makeActionsColumn(
  onEdit: (sponsor: DBSponsor) => void,
  onToggleArchive: (sponsor: DBSponsor) => void,
  pendingId: number | null,
): ColumnDef<DBSponsor> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (sponsor) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(sponsor)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={sponsor.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={sponsor.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={sponsor.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === sponsor.id}
            disabled={pendingId !== null && pendingId !== sponsor.id}
            onClick={() => onToggleArchive(sponsor)}>
            {sponsor.archivedAt ? (
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

export function SponsorsTable({sponsors}: SponsorsTableProps) {
  const router = useRouter();
  const [modalOpened, {open: openModal, close: closeModal}] =
    useDisclosure(false);
  const [editModalOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [editingSponsor, setEditingSponsor] = useState<DBSponsor | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const onEdit = useCallback(
    (sponsor: DBSponsor) => {
      setEditingSponsor(sponsor);
      openEditModal();
    },
    [openEditModal],
  );

  const onCloseEditModal = useCallback(() => {
    closeEditModal();
    setEditingSponsor(null);
  }, [closeEditModal]);

  const onToggleArchive = useCallback(
    (sponsor: DBSponsor) => {
      const archive = !sponsor.archivedAt;
      setPendingId(sponsor.id);

      void (async () => {
        try {
          const result = await toggleArchive('sponsors', sponsor.id, archive);

          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message:
              result.error ?? 'Archivaci sponzora se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci sponzora se nepodařilo dokončit.',
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

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openModal}>
          Přidat sponzora
        </Button>
      </Group>

      <CreateSponsorModal opened={modalOpened} onCloseAction={closeModal} />
      <EditSponsorModal
        opened={editModalOpened}
        sponsor={editingSponsor}
        onCloseAction={onCloseEditModal}
      />

      <AdminTable
        title="Sponzoři"
        data={sponsors}
        columns={allColumns}
        searchPlaceholder="Hledat podle názvu nebo odkazu..."
        defaultSort={{columnKey: 'name', direction: 'asc'}}
        getRowKey={(sponsor) => sponsor.id}
        noun={{genitivePlural: 'sponzorů'}}
        emptyMessage="Žádní sponzoři v databázi."
        noSearchResultsMessage="Žádní sponzoři neodpovídají vyhledávání."
      />
    </>
  );
}
