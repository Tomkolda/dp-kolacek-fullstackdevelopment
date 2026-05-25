'use client';

import {
  ActionIcon,
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
import type {DBMember} from '@/db/types';
import {toggleArchive} from '@/lib/server/toggleArchive';

import {CreateMemberModal} from './CreateMemberModal';
import {EditMemberModal} from './EditMemberModal';

const columns: Array<ColumnDef<DBMember>> = [
  {
    key: 'name',
    header: 'Jméno',
    render: (member) => (
      <Text fw={500} lineClamp={1}>
        {member.name}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => a.name.localeCompare(b.name, 'cs'),
    searchValue: (member) => member.name,
  },
  {
    key: 'instrument',
    header: 'Nástroj',
    render: (member) => (
      <Text size="sm" lineClamp={1}>
        {member.instrument}
      </Text>
    ),
    searchValue: (member) => member.instrument,
  },
  {
    key: 'location',
    header: 'Lokace',
    render: (member) => (
      <Text size="sm" lineClamp={1}>
        {member.location || '—'}
      </Text>
    ),
    searchValue: (member) => member.location ?? '',
  },
];

function makeActionsColumn(
  onEdit: (member: DBMember) => void,
  onToggleArchive: (member: DBMember) => void,
  pendingId: number | null,
): ColumnDef<DBMember> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (member) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(member)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={member.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={member.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={member.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === member.id}
            disabled={pendingId !== null && pendingId !== member.id}
            onClick={() => onToggleArchive(member)}>
            {member.archivedAt ? (
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

type MembersTableProps = {
  members: DBMember[];
};

const sharedTableProps = {
  searchPlaceholder: 'Hledat podle jména, nástroje nebo lokace...',
  getRowKey: (member: DBMember) => member.id,
  noun: {genitivePlural: 'členů'} as const,
  emptyMessage: 'Žádní členové v databázi.',
  noSearchResultsMessage: 'Žádní členové neodpovídají vyhledávání.',
};

export function MembersTable({members}: MembersTableProps) {
  const router = useRouter();
  const [createModalOpened, {open: openCreateModal, close: closeCreateModal}] =
    useDisclosure(false);
  const [editModalOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [memberToEdit, setMemberToEdit] = useState<DBMember | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const onEdit = useCallback(
    (member: DBMember) => {
      setMemberToEdit(member);
      openEditModal();
    },
    [openEditModal],
  );

  const onCloseEditModal = useCallback(() => {
    closeEditModal();
    setMemberToEdit(null);
  }, [closeEditModal]);

  const onToggleArchive = useCallback(
    (member: DBMember) => {
      const archive = !member.archivedAt;
      setPendingId(member.id);

      void (async () => {
        try {
          const result = await toggleArchive('members', member.id, archive);
          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message: result.error ?? 'Archivaci člena se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci člena se nepodařilo dokončit.',
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

  const {activeCount, archivedCount} = useMemo(() => {
    const archived = members.filter((member) => member.archivedAt).length;
    return {
      activeCount: members.length - archived,
      archivedCount: archived,
    };
  }, [members]);

  return (
    <Box>
      <Group justify="space-between" align="flex-end" mb="md">
        <Box>
          <Title order={2}>Sestava</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Celkem {members.length} členů ({activeCount} aktivních,{' '}
            {archivedCount} archivovaných)
          </Text>
        </Box>
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}>
          Přidat člena
        </Button>
      </Group>

      <CreateMemberModal
        opened={createModalOpened}
        onCloseAction={closeCreateModal}
      />
      <EditMemberModal
        opened={editModalOpened}
        member={memberToEdit}
        onCloseAction={onCloseEditModal}
      />

      <AdminTable
        {...sharedTableProps}
        data={members}
        columns={allColumns}
        defaultSort={{columnKey: 'name', direction: 'asc'}}
      />
    </Box>
  );
}
